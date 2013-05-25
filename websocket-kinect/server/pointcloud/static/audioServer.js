var selfEasyrtcid = "";
 
function disable(id) {
    document.getElementById(id).disabled = "disabled";
}
 
 
function enable(id) {
    document.getElementById(id).disabled = "";
}
 
 
function connect() {
    console.log("Initializing.");
    easyRTC.enableVideo(false);
    easyRTC.setLoggedInListener(convertListToButtons);
    easyRTC.initMediaSource(
        function(){        // success callback
            easyRTC.connect("audioOnly", loginSuccess, loginFailure);
        },
        function(errmesg){
            alert(errmesg);
        }  // failure callback
        );
}
 
 
function terminatePage() {
    easyRTC.disconnect();
}
 
 
function hangup() {
    easyRTC.hangupAll();
    disable('hangupButton');
}
 
 
function clearConnectList() {
    otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
 
}
 
 
function convertListToButtons (data) {
    clearConnectList();
    otherClientDiv = document.getElementById('otherClients');
    for(var i in data) {
        var button = document.createElement('button');
        button.onclick = function(easyrtcid) {
            return function() {
                performCall(easyrtcid);
            }
        }(i);
            
        label = document.createElement('text');
        label.innerHTML = easyRTC.cleanId(i);
        button.appendChild(label);
        otherClientDiv.appendChild(button);
    }
}
 
 
function performCall(otherEasyrtcid) {
    easyRTC.hangupAll();
    var acceptedCB = function(accepted, caller) {
        if( !accepted ) {
            alert("Sorry, your call to " + caller + " was rejected");
            enable('otherClients');
        }
    }
    var successCB = function() {
        enable('hangupButton');
    }
    var failureCB = function() {
        enable('otherClients');
    }
    easyRTC.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}
 
 
function loginSuccess(easyRTCId) {
    disable("connectButton");
    // enable("disconnectButton");
    enable('otherClients');
    selfEasyrtcid = easyRTCId;
    document.getElementById("iam").innerHTML = "I am " + easyRTCId;
}
 
 
function loginFailure(message) {
    alert("failure to login");
}
 
 
function disconnect() {
    document.getElementById("iam").innerHTML = "logged out";
    easyRTC.disconnect();
    console.log("disconnecting from server");
    enable("connectButton");
    // disable("disconnectButton");
    clearConnectList();
}
 
 
easyRTC.setStreamAcceptor( function(caller, stream) {
    var audio = document.getElementById('callerAudio');
    easyRTC.setVideoObjectSrc(audio,stream);
    console.log("saw audio from " + caller);
    enable("hangupButton");
});
 
 
easyRTC.setOnStreamClosed( function (caller) {
   easyRTC.setVideoObjectSrc(document.getElementById('callerAudio'), "");
});
 
 
easyRTC.setAcceptChecker(function(caller, cb) {
    document.getElementById('acceptCallBox').style.display = "block";
    if( easyRTC.getConnectionCount() > 0 ) {
        document.getElementById('acceptCallLabel').textContent = "Drop current call and accept new from " + caller + " ?";
    }
    else {
        document.getElementById('acceptCallLabel').textContent = "Accept incoming call from " + caller + " ?";
    }
    var acceptTheCall = function(wasAccepted) {
       document.getElementById('acceptCallBox').style.display = "none";
       if( wasAccepted && easyRTC.getConnectionCount() > 0 ) {
            easyRTC.hangupAll();    
       }
       cb(wasAccepted);
    }
    document.getElementById("callAcceptButton").onclick = function() { acceptTheCall(true);};
    document.getElementById("callRejectButton").onclick =function() { acceptTheCall(false);};    
} );
