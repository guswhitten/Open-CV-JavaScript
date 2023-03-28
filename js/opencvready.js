function openCvReady() {
  cv["onRuntimeInitialized"] = () => {
    let video = document.getElementById("cam_input"); // video is the id of video tag
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        alert("An error occurred! " + err);
      });
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(cam_input);
    const FPS = 60;

    function processVideo() {
      let begin = Date.now();
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
      cv.imshow("canvas_output", dst);
      // schedule next one.
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
  };
}
