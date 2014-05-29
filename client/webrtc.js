var webrtc;
var webrtcPeers = { };

function initWebRTC(w) {
    if (webrtc) {
        webrtc.destroy();
    }
    
    webrtc = new Peer( {host: window.location.hostname, port: w.port, path: '/n'});
    // stun.stunprotocol.org (UDP and TCP ports 3478).
    /* https://gist.github.com/yetithefoot/7592580
     *  {url:'stun:stun01.sipphone.com'},
        {url:'stun:stun.ekiga.net'},
        {url:'stun:stun.fwdnet.net'},
        {url:'stun:stun.ideasip.com'},
        {url:'stun:stun.iptel.org'},
        {url:'stun:stun.rixtelecom.se'},
        {url:'stun:stun.schlund.de'},
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'},
        {url:'stun:stun.softjoys.com'},
        {url:'stun:stun.voiparound.com'},
        {url:'stun:stun.voipbuster.com'},
        {url:'stun:stun.voipstunt.com'},
        {url:'stun:stun.voxgratia.org'},
        {url:'stun:stun.xten.com'},
     * 
     */

    webrtc.on('open', function(id) {
        $N.channelSend("webrtc", { a: $N.id(), w: Date.now(), m: id } );
        $N.channelSend("main", { a: $N.id(), w: Date.now(), m: 'WebRTC connected (' + id + ')' } );
    });
    webrtc.on('connection', function(dataConnection) {  });
    webrtc.on('error', function(e) { console.error('WebRTC', error) });
    webrtc.on('close', function() { 
        //console.log('WebRTC off') 
    });
    
    $N.on('channel:webrtc', function(m) {
        var userID = m.a;
        if (userID == $N.id())
            return;
        
        //var webrtcID = m.m;
        if (webrtcPeers[userID])
            webrtcPeers[userID].push(m.m);
        else
            webrtcPeers[userID] = [ m.m ];        
    });
    
    /*$N.on('channel:'+channel, function(m) {
       if (c.closest(document.documentElement).length === 0) {
           $N.off('channel:'+channel, this);
           c.remove();
       }
       
       updateLog();
       
       if (m.a!==$N.id()) {
           var A = $N.instance[m.a];
           var aname = A ? A.name : m.a;
           
           notify({title: aname, text: m.m });
       }
    });    */
}

function newWebRTCRoster() {
    if (!webrtc) return;
    
    var r = newDiv();
    var myVideo = newEle('video').appendTo(r);
    var theirVideo = newEle('video').appendTo(r);
    var peers = newDiv().appendTo(r);
    
    function update() {
        peers.empty();
        
        
        peers.append(JSON.stringify(webrtcPeers));
        _.each(webrtcPeers, function(peerids, userid) {
            var U = $N.instance[userid];
            if (!U) return;
            
            peers.append(newAvatarImage(U));
            peerids.forEach(function(p) {
                r.append($('<button>Call ' + p + '</button>').click(function() {
                    webRTCVideo(p, myVideo, function(localStream, call) {
                        call.on('stream', function(stream){
                            theirVideo.attr('src', URL.createObjectURL(stream));
                            theirVideo[0].play();
                        });                        
                    });
                }));
            });
            peers.append('<br/>');
        });
        
        //r.append(webrtc.id);        
    }
    update();

    webrtc.on('call', function(call) {
        notify({title:'Incoming Call', text: '' });
        
        webRTCVideo(null, myVideo, function(stream) {
            call.answer(stream);            
        });
        call.on('stream', function(stream){
            theirVideo.attr('src', URL.createObjectURL(stream));
            theirVideo[0].play();
        });
        //console.log(mediaConnection);
    });
    
    $N.on('channel:webrtc', function(m) {
       if (r.closest(document.documentElement).length === 0) {
           $N.off('channel:webrtc', this);
       }
       update();
    });
    
    return r;
}

function webRTCVideo(callPeer, target, callback) {
    navigator.getUserMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia (

            // constraints
            { video: true, audio: true },

            // successCallback
            function(localMediaStream) {
               target.attr('src', window.URL.createObjectURL(localMediaStream));               
               target[0].play();
               
               var call = null;
               if (callPeer) {
                   call = webrtc.call(callPeer, localMediaStream);
               }
               
               if (callback)
                   callback(localMediaStream, call);
            },

            // errorCallback
            function(err) {
               console.log("The following error occured: " + err);
            }
        );
    } else {
        console.log("getUserMedia not supported");
    }    
    
}

//http://simplewebrtc.com/
//https://github.com/HenrikJoreteg/getScreenMedia
//https://github.com/peers/peerjs/blob/master/examples/videochat/index.html
//http://www.html5rocks.com/en/tutorials/webrtc/datachannels/ file transfers
/*
 * <html>
<head>
  <title>PeerJS - Video chat example</title>
  <link rel="stylesheet" href="style.css">
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
  <script type="text/javascript" src="/dist/peer.js"></script>
  <script>

    // Compatibility shim
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // PeerJS object
    var peer = new Peer({ key: 'lwjd5qra8257b9', debug: 3});

    peer.on('open', function(){
      $('#my-id').text(peer.id);
    });

    // Receiving a call
    peer.on('call', function(call){
      // Answer the call automatically (instead of prompting user) for demo purposes
      call.answer(window.localStream);
      step3(call);
    });
    peer.on('error', function(err){
      alert(err.message);
      // Return to step 2 if error occurs
      step2();
    });

    // Click handlers setup
    $(function(){
      $('#make-call').click(function(){
        // Initiate a call!
        var call = peer.call($('#callto-id').val(), window.localStream);

        step3(call);
      });

      $('#end-call').click(function(){
        window.existingCall.close();
        step2();
      });

      // Retry if getUserMedia fails
      $('#step1-retry').click(function(){
        $('#step1-error').hide();
        step1();
      });

      // Get things started
      step1();
    });

    function step1 () {
      // Get audio/video stream
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));

        window.localStream = stream;
        step2();
      }, function(){ $('#step1-error').show(); });
    }

    function step2 () {
      $('#step1, #step3').hide();
      $('#step2').show();
    }

    function step3 (call) {
      // Hang up on an existing call if present
      if (window.existingCall) {
        window.existingCall.close();
      }

      // Wait for stream on the call, then set peer video display
      call.on('stream', function(stream){
        $('#their-video').prop('src', URL.createObjectURL(stream));
      });

      // UI stuff
      window.existingCall = call;
      $('#their-id').text(call.peer);
      call.on('close', step2);
      $('#step1, #step2').hide();
      $('#step3').show();
    }

  </script>


</head>

<body>

  <div class="pure-g">

      <!-- Video area -->
      <div class="pure-u-2-3" id="video-container">
        <video id="their-video" autoplay></video>
        <video id="my-video" muted="true" autoplay></video>
      </div>

      <!-- Steps -->
      <div class="pure-u-1-3">
        <h2>PeerJS Video Chat</h2>

        <!-- Get local audio/video stream -->
        <div id="step1">
          <p>Please click `allow` on the top of the screen so we can access your webcam and microphone for calls.</p>
          <div id="step1-error">
            <p>Failed to access the webcam and microphone. Make sure to run this demo on an http server and click allow when asked for permission by the browser.</p>
            <a href="#" class="pure-button pure-button-error" id="step1-retry">Try again</a>
          </div>
        </div>

        <!-- Make calls to others -->
        <div id="step2">
          <p>Your id: <span id="my-id">...</span></p>
          <p>Share this id with others so they can call you.</p>
          <h3>Make a call</h3>
          <div class="pure-form">
            <input type="text" placeholder="Call user id..." id="callto-id">
            <a href="#" class="pure-button pure-button-success" id="make-call">Call</a>
          </div>
        </div>

        <!-- Call in progress -->
        <div id="step3">
          <p>Currently in call with <span id="their-id">...</span></p>
          <p><a href="#" class="pure-button pure-button-error" id="end-call">End call</a></p>
        </div>
      </div>
  </div>


</body>
</html>
 */