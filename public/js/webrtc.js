//*****************************************************************************
// RTC Manager
//*****************************************************************************

window.RTCPeerConnection = window.webkitRTCPeerConnection 
                            || window.mozRTCPeerConnection
                            || window.RTCPeerConnection;

window.RTCSessionDescription = window.webkitRTCSessionDescription 
                            || window.mozRTCSessionDescription
                            || window.RTCSessionDescription;

navigator.getUserMedia = navigator.getUserMedia 
                            || navigator.webkitGetUserMedia 
                            || navigator.mozGetUserMedia;


function RTCManager() {
    var constraints = {audio: true, video: true};
    navigator.getUserMedia(constraints, 
      this.successLocalMedia.bind(this), this.errorLocalMedia.bind(this));
}

RTCManager.prototype.successLocalMedia = function(stream) {
    this.localStream = stream;
    
    // Update local video display
    var localvideo = $("#localVideo")[0];
    localvideo.mozSrcObject = stream;
    localvideo.src = URL.createObjectURL(stream);
    localvideo.play();
    localvideo.muted = true;
}

RTCManager.prototype.errorLocalMedia = function(error){
    console.log("navigator.getUserMedia error: ", error);
}

RTCManager.prototype.createOffer = function(offerCb) {

    this.peerConnection = new RTCPeerConnection(null);
    this.peerConnection.addStream(this.localStream);

    this.peerConnection.onaddstream = function(evt) {
        this.updateRemoteVideo(evt.stream);
    }.bind(this);

    this.peerConnection.createOffer(
        function(offer) {
            this.peerConnection.setLocalDescription(offer);
            offerCb(offer);
        }.bind(this)
        ,
        function(error) {
            console.log("ERROR createOffer : " + error);
        }
    );
}

RTCManager.prototype.createAnswer = function(sdp, answerCb) {

    this.peerConnection = new RTCPeerConnection(null);
    this.peerConnection.addStream(this.localStream);
 
    this.peerConnection.onaddstream = function(obj) {
        this.updateRemoteVideo(obj.stream);
    }.bind(this);
 
    var sessionDesc = new RTCSessionDescription(sdp);
    this.peerConnection.setRemoteDescription(sessionDesc, function() {
        this.peerConnection.createAnswer(
            function(answer) {
                this.peerConnection.setLocalDescription(answer, function() {
                    answerCb(answer);
                });
            }.bind(this)
            ,
            function(error) {
                console.log("ERROR createAnswer : " + error);
            });
    }.bind(this));
}

RTCManager.prototype.setRemoteDescription = function(sdp) {
    var sessionDesc = new RTCSessionDescription(sdp);
    this.peerConnection.setRemoteDescription(sessionDesc, 
        function() {
            console.log("Session established");
        }
        ,
        function(error) {
            console.log("ERROR setRemoteDescription : " + error);
        }
    );
}

RTCManager.prototype.endSession = function() {
    var remotevideo = $("#remoteVideo")[0];
    remotevideo.pause();
    remotevideo.src = null;
    
    this.peerConnection = null;
}

RTCManager.prototype.updateRemoteVideo = function(stream) {
    var remotevideo = $("#remoteVideo")[0];
    remotevideo.mozSrcObject = stream;
    remotevideo.src = URL.createObjectURL(stream);
    remotevideo.play();
}