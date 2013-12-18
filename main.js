var express = require("express");
var http = require("http");
var WebSocketServer = require("websocket").server;

//***********************************************
// Express configuration
//***********************************************
var app = express();
var httpServer = http.createServer(app);

app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/public'));
});

httpServer.listen(8888);
console.log("Listening on port 8888...");

//***********************************************
// WebSockets Connections
//***********************************************
var connections = [];

var wsServer = new WebSocketServer({
    httpServer: httpServer
});

wsServer.on('request', function(request) {

    var connection = request.accept('callsig-protocol', request.origin);
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            try {
                console.log("MESSAGE=" + message.utf8Data);
                var command = JSON.parse(message.utf8Data);
                eval(command.action + "(command, connection)");
            }
            catch(e) {
                console.log("on message error=" + e);
            }
        }
    });
    
    connection.on('close', function(reasonCode, description) {
        for (var i in connections) {
            if (connections[i].connection === connection) {
                connections.splice(i, 1);
                break;
            }
        }
        broadcastUserList();
    });
});

/**
 * Process 'register' request.
 */
function register(command, connection) {
    var connectionInfo = {};
    connectionInfo.userId = command.userId;
    connectionInfo.connection = connection;
    connectionInfo.status = "online";
    connections.push(connectionInfo);

    broadcastUserList();
}

/**
 * Process 'list' request.
 * Returns a list of the regsitered users.
 */
function list(command, connection) {
    var users = [];
    connections.forEach(function(connection) {
        if (connection.userId !== command.userId) {
            users.push({name:connection.userId});
        }
    });

    var result = {};
    result.command = "list";
    result.users = users;
    connection.sendUTF(JSON.stringify(result));
}

/**
 * Process 'invite' request (sends by the caller).
 * Sends the 'invite' request to the callee if he/she is registered.
 */
function invite(command, connection) {
    var callee = command.callee;
    var calleeInfo = getConnection(callee);

    if (calleeInfo) {
        var result = {};
        result.command = 'invite';
        result.caller = command.caller;
        result.sdp = command.sdp;
        calleeInfo.connection.sendUTF(JSON.stringify(result));
    }
}

/**
 * Process 'ack' request (sends by the callee).
 * Sends the 'ack' request to the caller.
 */
function ack(command, connection) {
    var caller = command.caller;
    var callerInfo = getConnection(caller);
    var callee = command.callee;
    var calleeInfo = getConnection(callee);
                    
    if (callerInfo) {
        var result = {};
        result.command = 'ack';
        result.callee = command.callee;
        result.sdp = command.sdp;
        callerInfo.connection.sendUTF(JSON.stringify(result));

        callerInfo.status = "busy";
        calleeInfo.status = "busy";
        broadcastUserList();
    }
}

/**
 * Process 'bye' request (sends by the callee or the caller).
 * Sends the 'bye' request to the other particpant.
 */
function bye(command, connection) {
    var initiator = command.initiator;
    var initiatorInfo = getConnection(initiator);
    var callParticipant = command.callParticipant;
    var callParticipantInfo = getConnection(callParticipant);
                    
    if (callParticipantInfo) {
        var result = {};
        result.command = 'bye';
        callParticipantInfo.connection.sendUTF(JSON.stringify(result));

        callParticipantInfo.status = "online";
    }

    if (initiatorInfo) {
        initiatorInfo.status = "online";
    }

    broadcastUserList();
}

function broadcastUserList() {
    connections.forEach(function(connInfo) {
        var users = [];
        connections.forEach(function(connInfo2) {
            if (connInfo.userId !== connInfo2.userId) {
                users.push({name:connInfo2.userId, status:connInfo2.status});
            }
        });
        var result = {};
        result.command = "list";
        result.users = users;
        connInfo.connection.sendUTF(JSON.stringify(result));
    });
}

function getConnection(username) {
    for (var i in connections) {
        var connInfo = connections[i];
        if (connInfo.userId === username) {
            return connInfo;
        }
    }

    return null;
}
