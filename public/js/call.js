//*****************************************************************************
// CALL MANAGEMENT
//*****************************************************************************

window.WebSocket = window.WebSocket || window.MozWebSocket;

function CallManager(rtcManager) {
    this.rtcManager = rtcManager;
    this.wsConnection = null;
    this.callParticipant = null;
}

CallManager.prototype.closeConnection = function() {

    if (this.wsConnection) {
        this.wsConnection.close();
    }
}

CallManager.prototype.createConnection = function(username) { 

    this.username = username;
    this.wsConnection = new WebSocket('ws://' + window.location.host, 'callsig-protocol');

    $('#console').val($('#console').val() + '\n websocket url : ws://' + window.location.host);

    this.wsConnection.onopen = function () {
        this.send(JSON.stringify({ action:"register", userId:username }));
        angular.element('[ng-controller=UserController]').scope()
            .setUser({name:username, status:"online"});
    };

    this.wsConnection.onerror = function (error) {
        console.log("websocket error : " + error);
        $('#console').val($('#console').val() + '\n websocket error : ' + error);
    };

    this.wsConnection.onmessage = function (message) {
        $('#console').val($('#console').val() + '\n websocket msg : ' + message.data);
        try {
            var msg = JSON.parse(message.data);

            if (msg.command === "list") {
                angular.element('[ng-controller=UserController]').scope().setUsers(msg.users);
            }
            else if (msg.command === "invite") {
                this.callParticipant = {};
                this.callParticipant.name = msg.caller;
                this.callParticipant.sdp = msg.sdp;

                $('#caller').text(msg.caller);
                $('#callModal').modal('show');
            }
            else if (msg.command === "ack") {
                angular.element('[ng-controller=UserController]').scope().setStatus("busy");
                this.rtcManager.setRemoteDescription(msg.sdp);
            }
            else if (msg.command === "bye") {
                angular.element('[ng-controller=UserController]').scope().setStatus("online");
                this.rtcManager.endSession();
            }
            else {
                console.log("Unknow command : " + msg.command);
            }
        }
        catch (e) {
            console.log('Problem with message : msg=' + message.data + ', error=', e);
            $('#console').val($('#console').val() + '\n Problem with message : msg=' + message.data + ', error=' + e);
        }
    }.bind(this);
}

CallManager.prototype.invite = function(calleeName) {
    this.callParticipant = {};
    this.callParticipant.name = calleeName;

    this.rtcManager.createOffer(this.sendInvite.bind(this));
}

CallManager.prototype.sendInvite = function(offer) {
    this.wsConnection.send(JSON.stringify(
        { action:"invite", caller:this.username, callee:this.callParticipant.name, sdp:offer }));
}

CallManager.prototype.acceptCall = function() {
    angular.element('[ng-controller=UserController]').scope().setStatus("busy");
    this.rtcManager.createAnswer(this.callParticipant.sdp, this.sendAck.bind(this));
}

CallManager.prototype.sendAck = function(offer) {
    this.wsConnection.send(JSON.stringify(
        { action:"ack", callee:this.username, caller:this.callParticipant.name, sdp:offer }));
}

CallManager.prototype.bye = function() {
    angular.element('[ng-controller=UserController]').scope().setStatus("online");
    this.rtcManager.endSession();
    this.wsConnection.send(JSON.stringify(
        { action:"bye", initiator:this.username, callParticipant:this.callParticipant.name }));
}