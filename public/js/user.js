//*****************************************************************************
// USER MANAGEMENT
//*****************************************************************************

function UserManager(callManager) {
    this.username = null;//$.cookie("username");
    this.callManager = callManager;

    this.updateUserInfo();
}

UserManager.prototype.login = function() {
    var inputUsername = $("#inputUsername").val();

    if (inputUsername !== "") {
        $('#loginModal').modal('hide');
        this.username = inputUsername;
        //$.cookie("username", this.username);
        this.updateUserInfo();
    }
}

UserManager.prototype.updateUserInfo = function() {
    if (this.username == null) {
        angular.element('[ng-controller=UserController]').scope().logout();
        //angular.element($("#userlist")).scope().logout();
        $("#alertLogin").show();
        $("#logBtn").text("Login");
        $("#usernameLbl").text("");
        this.callManager.closeConnection();
    }
    else {
        $("#alertLogin").hide();
        $("#logBtn").text("Logout");   
        $("#usernameLbl").text("Hello, " + this.username);
        this.callManager.createConnection(this.username);
    }
}

UserManager.prototype.loginOrLogout = function() {
    if (this.username != null) {
        this.username = null;
        //$.cookie("username", null);
        this.updateUserInfo();
    }
    else {
        $('#loginModal').modal('show');
    }
}