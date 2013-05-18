easyRTC.setStreamAcceptor( function(callerEasyrtcid, stream) {  
        var video = document.getElementById('caller');
        easyRTC.setVideoObjectSrc(video, stream);
    });

     easyRTC.setOnStreamClosed( function (callerEasyrtcid) {
        easyRTC.setVideoObjectSrc(document.getElementById('caller'), "");
    });


    function my_init() {
        easyRTC.setLoggedInListener( loggedInListener);
        var connectSuccess = function(myId) {
            console.log("My easyrtcid is " + myId);
        }
        var connectFailure = function(errmesg) {
            console.log(errmesg);
        }
	easyRTC.enableVideo(false);
        easyRTC.initMediaSource(
              function(){      // success callback    
                  var selfVideo = document.getElementById("self");    
                  easyRTC.setVideoObjectSrc(selfVideo, easyRTC.getLocalStream());
                  easyRTC.connect("Company Chat Line", connectSuccess, connectFailure);
              },
              connectFailure
        );
     }


    function loggedInListener(connected) {
        var otherClientDiv = document.getElementById('otherClients');
        while (otherClientDiv.hasChildNodes()) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
        for(var i in connected) {
            var button = document.createElement('button');
            button.onclick = function(easyrtcid) {
                return function() {
                    performCall(easyrtcid);
                }
            }(i);

            label = document.createTextNode(i);
            button.appendChild(label);
            otherClientDiv.appendChild(button);
        }
    }


    function performCall(easyrtcid) {
        easyRTC.call(
           easyrtcid, 
           function(easyrtcid) { console.log("completed call to " + easyrtcid);},
           function(errorMessage) { console.log("err:" + errorMessage);},
           function(accepted, bywho) {
              console.log((accepted?"accepted":"rejected")+ " by " + bywho);
           }
       );
    }
