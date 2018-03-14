window.sourceImageUrl = "";
(function () {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 640;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var file = null;
  var data = null;
  var captureSeconds = [3, 26, 27, 28, 107, 108, 109];
  captureSeconds.sort((a, b) => a - b);
  var results = [];

  function startup() {
    video = document.getElementById('video');
    videof1 = document.getElementById('videof1');
    videof1.addEventListener('timeupdate', function (ev) {
      let currentSecond = Math.ceil(ev.srcElement.currentTime);
      console.log(currentSecond);
      let index = captureSeconds.findIndex(n => n == currentSecond);
      if (index > -1) {
        console.log("capturing");
        captureSeconds.shift();
        takepicture(currentSecond);
      }
    });
    videof1.addEventListener('ended', function (ev) {
      if (results) {
        generateFile(results);
        showResult()
      }
    });
    videof1.addEventListener('pause', function (ev) {
      if (results) {
        generateFile(results);
        showResult()
      }
    });

    canvas = document.getElementById('canvas');
    startbutton = document.getElementById('startbutton');

    navigator.getMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function (stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function (err) {
        console.log("An error occured! " + err);
      }
    );


    video.addEventListener('canplay', function (ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

  }


  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture(second) {
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL('image/png');
    var blobBin = atob(data.split(',')[1]);
    var array = [];
    for (var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    file = new Blob([new Uint8Array(array)], { type: 'image/png' });
    getData(second)
  }
  function getData(second) {
    var uriBase = "https://" + env.face_location + ".api.cognitive.microsoft.com/face/v1.0/detect";
    // Request parameters.
    var params = "returnFaceId=true&returnFaceLandmarks=true&returnFaceAttributes=age%2Cgender%2CheadPose%2Csmile%2CfacialHair%2Cglasses%2Cemotion%2Chair%2Cmakeup%2Cocclusion%2Caccessories%2Cblur%2Cexposure%2Cnoise"
    var url = uriBase + "?" + params;

    httpRequest = new XMLHttpRequest()
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader("Content-Type", "application/octet-stream");
    httpRequest.setRequestHeader("Ocp-Apim-Subscription-Key", env.face_key);
    httpRequest.onreadystatechange = function () {
      // Process the server response here.
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var content = JSON.parse(httpRequest.responseText);
          // console.log(JSON.stringify(content, null, 2));
          content.forEach(face => {
            renderChart(face.faceAttributes.emotion);
            var frame = face.faceAttributes.emotion;
            frame.second = second;
            results.push(frame);
          });
        } else {
          console.log('There was a problem with the request.');
        }
      }
    }
    httpRequest.send(file);
  }
  var showResult = function () {
    var resultContainer = document.getElementById("result");
    let happiness = 0;
    let sadness = 0;
    let neutral = 0;
    let disgust = 0;
    let anger = 0;
    results.forEach(r => {
      happiness += r.happiness;
      sadness += r.sadness;
      neutral += r.neutral;
      disgust += r.disgust;
      anger += r.anger;
    });
    let sentence = 'Inconclusive';
    if (happiness / results.length > 0.35) {
      sentence = 'You like crashes'
    } else if (sadness / results.length > 0.35) {
      sentence = 'You dont like crashes';
    } else if (disgust / results.length > 0.35) {
      sentence = 'You hate crashes'
    } else if (anger / results.length > 0.35) {
      sentence = 'Crashes make you anger';
    }
    resultContainer.textContent = sentence;
    generateGauge(happiness,'happiness',"Happiness");
    generateGauge(sadness,'sadness',"Sadness");
    generateGauge(disgust,'disgust',"Disgust");
    generateGauge(anger,'anger',"Anger");
    console.log(sentence);
  }

  window.addEventListener('load', startup, false);
})();