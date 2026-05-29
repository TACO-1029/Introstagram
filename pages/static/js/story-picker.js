const storyPickerButton = document.querySelector("[data-story-picker]");
const storyImagePicker = document.querySelector("#storyImagePicker");
const cameraModal = document.querySelector("[data-camera-modal]");
const cameraVideo = document.querySelector("#storyCameraVideo");
const cameraMessage = document.querySelector("[data-camera-message]");
const cameraCaptureButton = document.querySelector("[data-camera-capture]");
const cameraCloseButton = document.querySelector("[data-camera-close]");
const fileFallbackButton = document.querySelector("[data-file-fallback]");
const filterToggleButton = document.querySelector("[data-filter-toggle]");
const arMaskImage = document.querySelector("[data-ar-mask]");

let cameraStream = null;
let filterEnabled = false;
let faceMesh = null;
let faceTrackingFrame = null;
let lastMaskBox = null;
let processingFaceFrame = false;

async function openStoryCamera() {
  cameraModal.hidden = false;
  cameraMessage.textContent = "카메라를 준비하는 중입니다.";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraMessage.textContent = "이 브라우저에서는 카메라를 바로 열 수 없습니다. 파일 선택을 이용해주세요.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });
    cameraVideo.srcObject = cameraStream;
    cameraMessage.textContent = "";
    startFaceTracking();
  } catch (error) {
    cameraMessage.textContent = "카메라 권한을 허용하거나 파일 선택을 이용해주세요.";
  }
}

function closeStoryCamera() {
  stopFaceTracking();
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  cameraVideo.srcObject = null;
  cameraModal.hidden = true;
}

function toggleFilter() {
  filterEnabled = !filterEnabled;
  filterToggleButton.classList.toggle("active", filterEnabled);
  arMaskImage.hidden = !filterEnabled;

  if (filterEnabled) {
    startFaceTracking();
  } else {
    lastMaskBox = null;
  }
}

async function startFaceTracking() {
  if (!filterEnabled || faceTrackingFrame || !cameraVideo.srcObject) {
    return;
  }

  if (!faceMesh) {
    const ready = await setupFaceMesh();

    if (!ready) {
      updateFallbackMask("AR 얼굴 추적 모델을 불러오지 못해 고정 필터로 표시합니다.");
    }
  }

  trackFace();
}

function stopFaceTracking() {
  if (faceTrackingFrame) {
    cancelAnimationFrame(faceTrackingFrame);
    faceTrackingFrame = null;
  }
}

async function setupFaceMesh() {
  if (!window.FaceMesh) {
    return false;
  }

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  faceMesh.onResults(updateMaskFromFaceMesh);

  return true;
}

function trackFace() {
  if (!filterEnabled || cameraModal.hidden) {
    faceTrackingFrame = null;
    return;
  }

  if (faceMesh && cameraVideo.readyState >= 2 && !processingFaceFrame) {
    processingFaceFrame = true;
    faceMesh
      .send({ image: cameraVideo })
      .catch(() => {
        updateFallbackMask("AR 얼굴 추적 중 문제가 생겨 고정 필터로 표시합니다.");
      })
      .finally(() => {
        processingFaceFrame = false;
      });
  } else {
    updateFallbackMask();
  }

  faceTrackingFrame = requestAnimationFrame(trackFace);
}

function updateMaskFromFaceMesh(results) {
  const [landmarks] = results.multiFaceLandmarks || [];

  if (!landmarks) {
    updateFallbackMask();
    return;
  }

  const forehead = landmarks[10];
  const nose = landmarks[1];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const previewRect = cameraVideo.getBoundingClientRect();
  const cheekDistance = Math.abs(rightCheek.x - leftCheek.x) * previewRect.width;
  const maskWidth = Math.max(170, cheekDistance * 1.95);
  const maskHeight = maskWidth;
  const centerX = (1 - nose.x) * previewRect.width;
  const top = forehead.y * previewRect.height - maskHeight * 0.38;
  const left = centerX - maskWidth / 2;

  lastMaskBox = {
    x: (1 - nose.x) * cameraVideo.videoWidth - (Math.abs(rightCheek.x - leftCheek.x) * cameraVideo.videoWidth * 1.95) / 2,
    y: forehead.y * cameraVideo.videoHeight - Math.abs(rightCheek.x - leftCheek.x) * cameraVideo.videoWidth * 1.95 * 0.38,
    width: Math.abs(rightCheek.x - leftCheek.x) * cameraVideo.videoWidth * 1.95,
    height: Math.abs(rightCheek.x - leftCheek.x) * cameraVideo.videoWidth * 1.95,
  };

  arMaskImage.style.setProperty("--mask-width", `${maskWidth}px`);
  arMaskImage.style.setProperty("--mask-height", `${maskHeight}px`);
  arMaskImage.style.setProperty("--mask-left", `${left}px`);
  arMaskImage.style.setProperty("--mask-top", `${top}px`);
  cameraMessage.textContent = "";
}

function updateFallbackMask(message = "") {
  const previewRect = cameraVideo.getBoundingClientRect();
  const maskWidth = previewRect.width * 0.68;
  const maskHeight = maskWidth;
  const left = (previewRect.width - maskWidth) / 2;
  const top = previewRect.height * 0.09;
  const videoWidth = cameraVideo.videoWidth || previewRect.width;
  const videoHeight = cameraVideo.videoHeight || previewRect.height;

  lastMaskBox = {
    x: videoWidth * 0.5 - videoWidth * 0.34,
    y: videoHeight * 0.04,
    width: videoWidth * 0.68,
    height: videoWidth * 0.68,
  };

  arMaskImage.style.setProperty("--mask-width", `${maskWidth}px`);
  arMaskImage.style.setProperty("--mask-height", `${maskHeight}px`);
  arMaskImage.style.setProperty("--mask-left", `${left}px`);
  arMaskImage.style.setProperty("--mask-top", `${top}px`);
  cameraMessage.textContent = message;
}

function openStoryImagePicker() {
  closeStoryCamera();
  storyImagePicker.click();
}

function goToStoryEditor(dataUrl) {
  sessionStorage.setItem("introstagramStoryImage", dataUrl);
  window.location.href = "./pages/story/index.html";
}

function captureStoryImage() {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
    cameraMessage.textContent = "카메라 화면이 준비된 뒤 다시 눌러주세요.";
    return;
  }

  const captureCanvas = document.createElement("canvas");
  captureCanvas.width = cameraVideo.videoWidth;
  captureCanvas.height = cameraVideo.videoHeight;
  const captureContext = captureCanvas.getContext("2d");
  captureContext.translate(captureCanvas.width, 0);
  captureContext.scale(-1, 1);
  captureContext.drawImage(cameraVideo, 0, 0);
  captureContext.setTransform(1, 0, 0, 1, 0, 0);

  if (filterEnabled && lastMaskBox) {
    captureContext.drawImage(arMaskImage, lastMaskBox.x, lastMaskBox.y, lastMaskBox.width, lastMaskBox.height);
  }

  goToStoryEditor(captureCanvas.toDataURL("image/png"));
}

function loadStoryImage(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    goToStoryEditor(reader.result);
  });

  reader.readAsDataURL(file);
}

storyPickerButton.addEventListener("click", openStoryCamera);
cameraCaptureButton.addEventListener("click", captureStoryImage);
cameraCloseButton.addEventListener("click", closeStoryCamera);
fileFallbackButton.addEventListener("click", openStoryImagePicker);
storyImagePicker.addEventListener("change", loadStoryImage);
filterToggleButton.addEventListener("click", toggleFilter);
