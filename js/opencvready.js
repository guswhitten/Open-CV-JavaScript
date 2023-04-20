const PRESETS = {
  default: { constant: 6, blockSize: 15, invert: false },
  ghost1: { constant: 0, blockSize: 3, invert: true },
  ghost2: { constant: -5, blockSize: 19, invert: true },
  sketch: { constant: 2, blockSize: 3, invert: false },
  dark1: { constant: -1, blockSize: 3, invert: false },
  dark2: { constant: 7, blockSize: 21, invert: true },
  rorschach: { constant: -5, blockSize: 105, invert: true },
};

function openCvReady() {
  cv["onRuntimeInitialized"] = () => {
    let video = document.getElementById("cam_input"); // video is the id of video tag
    let slider_constant = document.getElementById("slider_constant");
    let slider_block_size = document.getElementById("slider_block_size");
    let inverter = document.getElementById("inverter");
    let constant_output = document.getElementById("constant_output");
    let block_size_output = document.getElementById("block_size_output");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        alert("An error occurred! " + err);
      });
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(cam_input);
    const FPS = 60;

    // set initial values for sliders and add event listeners
    const presetSelect = document.getElementById("preset-select");
    presetSelect.addEventListener("change", (event) => {
      const presetSelected = event.target.value;
      slider_block_size.value = PRESETS[presetSelected].blockSize;
      slider_constant.value = PRESETS[presetSelected].constant;
      inverter.checked = PRESETS[presetSelected].invert;
      constant_output.innerHTML = slider_constant.value;
      block_size_output.innerHTML = slider_block_size.value;
    });

    slider_constant.oninput = () => {
      constant_output.innerHTML = slider_constant.value;
    };

    slider_block_size.oninput = () => {
      block_size_output.innerHTML = slider_block_size.value;
    };

    // looping function that transforms each pixel according to the slider values
    function processVideo() {
      let begin = Date.now();
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 1, 1, cv.BORDER_DEFAULT);

      cv.adaptiveThreshold(
        dst,
        dst,
        250,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        parseInt(slider_block_size.value),
        parseInt(slider_constant.value)
      );
      if (inverter.checked) {
        cv.bitwise_not(dst, dst);
      }

      cv.imshow("canvas_output", dst);
      // schedule next one based on frame rate constant.
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    }

    // schedule first video transformation.
    setTimeout(processVideo, 0);
  };
}

function takeScreenshot() {
  let canvas = document.getElementById("canvas_output");

  const dataURL = canvas.toDataURL("image/jpeg", 1.0);
  // Create a temporary anchor element
  const downloadLink = document.createElement("a");
  downloadLink.href = dataURL;
  const uuid = generateUuid();
  downloadLink.download = `screenshot-${uuid}.png`;

  // Append the anchor element to the document body
  document.body.appendChild(downloadLink);
  // Trigger a click event on the anchor element to start the download
  downloadLink.click();
  // Remove the anchor element from the document body
  document.body.removeChild(downloadLink);
}

/*
Generates a random UUID to append to screenshot.jpg file name for uniqueness.
*/
function generateUuid() {
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  const uuid = array.join("-");
  return uuid;
}
