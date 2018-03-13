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

  function startup() {
    video = document.getElementById('video');
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
        setInterval(takepicture,1000);
      }
    }, false);

    startbutton.addEventListener('click', function (ev) {
      takepicture();
      ev.preventDefault();
    }, false);

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      var blobBin = atob(data.split(',')[1]);
      var array = [];
      for (var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      file = new Blob([new Uint8Array(array)], { type: 'image/png' });
      getData()
    } else {
      clearphoto();
    }
  }
  function getData() {
    var uriBase = "https://" + env.face_location + ".api.cognitive.microsoft.com/face/v1.0/detect";
    // Request parameters.
    var params = {
      "returnFaceId": "true",
      "returnFaceLandmarks": "true",
      "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };
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
          });
        } else {
          console.log('There was a problem with the request.');
        }
      }
    }
    httpRequest.send(file);
  }
  var count = 1;
  function renderChart(emotion) {
    count++;
    dps.forEach(dp => {
      console.log(dp.name.toLowerCase() + ": " + emotion[dp.name.toLowerCase()]);
      dp.dataPoints.push(
        {
          x: count,
          y: emotion[dp.name.toLowerCase()]
        }
      )
      if(dp.dataPoints.length > dataLength)
      {
        dp.dataPoints.shift();
      }
    });
    chart.render();
  }
  var dps = [{
    type: "stackedColumn100",
    name: "Anger",
    color: "#A61103",
    showInLegend: true,
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Contempt",
    showInLegend: true,
    color: "#A4A9FF",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Disgust",
    showInLegend: true,
    color: "#4E2596",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Fear",
    showInLegend: true,
    color: "#F2B705",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Happiness",
    showInLegend: true,
    color: "#067302",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Neutral",
    showInLegend: true,
    color: "#F2F2F2",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Sadness",
    showInLegend: true,
    color: "#1F1E1E",
    dataPoints: [
    ]
  },
  {
    type: "stackedColumn100",
    name: "Surprise",
    showInLegend: true,
    color: "#F06E09",
    dataPoints: [
    ]
  }];
  var dataLength = 30; // number of dataPoints visible at any point
  var chart = new CanvasJS.Chart("chartContainer", {
    title: {
      text: "Dynamic Data"
    },
    axisX: {
      interval: 1,
      intervalType: "seconds"
    },
    axisY: {
      suffix: "%"
    },
    toolTip: {
      shared: true
    },
    legend: {
      reversed: true,
      verticalAlign: "center",
      horizontalAlign: "right"
    },
    data: dps
  });
  chart.render();
  console.log(chart);

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();