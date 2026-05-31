const storyPickerButton = document.querySelector("[data-story-picker]");
const storyImagePicker = document.querySelector("#storyImagePicker");
const storyList = document.querySelector(".story-list");
const firstMemberStoryItem = document.querySelector(
  '[data-highlight="member-1-profile"]',
);
const cameraModal = document.querySelector("[data-camera-modal]");
const cameraPanel = document.querySelector(".story-camera-panel");
const cameraVideo = document.querySelector("#storyCameraVideo");
const cameraMessage = document.querySelector("[data-camera-message]");
const cameraCaptureButton = document.querySelector("[data-camera-capture]");
const cameraCloseButtons = document.querySelectorAll("[data-camera-close]");
const fileFallbackButton = document.querySelector("[data-file-fallback]");
const filterOptionButtons = document.querySelectorAll("[data-filter-option]");
const arMaskImage = document.querySelector("[data-ar-mask]");
const modalEditor = document.querySelector("[data-story-modal-editor]");
const modalCanvas = document.querySelector("#storyModalCanvas");
const modalContext = modalCanvas.getContext("2d");
const modalBrushSize = document.querySelector("#storyModalBrushSize");
const modalColorButtons = document.querySelectorAll("[data-modal-color]");
const modalToolButtons = document.querySelectorAll("[data-modal-tool]");
const modalSaveButtons = document.querySelectorAll("[data-modal-save]");
const modalPublishButtons = document.querySelectorAll("[data-modal-publish]");
const modalImagePicker = document.querySelector("#storyModalImagePicker");
const modalBackgroundImage = new Image();
const publishedStoriesStorageKey = "introstagramPublishedStories";

const arFilters = {
  dog: {
    src: "./pages/static/story-filter/dog-face-mask.svg",
    aspectRatio: 1,
    anchor: "nose",
    anchorX: 0.5,
    anchorY: 0.7,
    minPreviewWidth: 170,
    previewWidthScale: 1.95,
    fallbackWidthRatio: 0.68,
    fallbackTopRatio: 0.09,
  },
  hyundai: {
    src: "./pages/static/story-filter/hyundai-dp-filter.svg",
    aspectRatio: 290 / 76,
    anchor: "forehead",
    anchorX: 0.5,
    anchorY: 0.86,
    minPreviewWidth: 210,
    previewWidthScale: 2.18,
    fallbackWidthRatio: 0.76,
    fallbackTopRatio: 0.17,
  },
};

let cameraStream = null;
let filterEnabled = false;
let activeFilterName = "dog";
let faceMesh = null;
let faceTrackingFrame = null;
let lastMaskBox = null;
let processingFaceFrame = false;
let modalCurrentColor = "#ffffff";
let modalCurrentTool = "pen";
let modalDrawing = false;
let modalLastPoint = null;
let publishedStoryItem = null;

function getActiveFilter() {
  return arFilters[activeFilterName] || arFilters.dog;
}

async function openStoryCamera() {
  cameraModal.hidden = false;
  cameraMessage.textContent = "카메라를 준비하는 중입니다.";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraMessage.textContent =
      "이 브라우저에서는 카메라를 바로 열 수 없습니다. 파일 선택을 이용해주세요.";
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
    cameraMessage.textContent =
      "카메라 권한을 허용하거나 파일 선택을 이용해주세요.";
  }
}

function stopCameraStream() {
  stopFaceTracking();
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  cameraVideo.srcObject = null;
}

function closeStoryModalEditor() {
  cameraPanel.classList.remove("is-editing");
  modalEditor.hidden = true;
  modalDrawing = false;
  modalLastPoint = null;
}

function closeStoryCamera() {
  stopCameraStream();
  closeStoryModalEditor();
  cameraModal.hidden = true;
}

function syncFilterButtons() {
  filterOptionButtons.forEach((button) => {
    const isActive =
      filterEnabled && button.dataset.filterOption === activeFilterName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function disableFilter() {
  filterEnabled = false;
  arMaskImage.hidden = true;
  lastMaskBox = null;
  syncFilterButtons();
}

function selectFilter(filterName) {
  if (filterEnabled && activeFilterName === filterName) {
    disableFilter();
    return;
  }

  activeFilterName = arFilters[filterName] ? filterName : "dog";
  filterEnabled = true;
  arMaskImage.src = getActiveFilter().src;
  arMaskImage.hidden = false;
  syncFilterButtons();

  if (filterEnabled) {
    startFaceTracking();
  }
}

async function startFaceTracking() {
  if (!filterEnabled || faceTrackingFrame || !cameraVideo.srcObject) {
    return;
  }

  if (!faceMesh) {
    const ready = await setupFaceMesh();

    if (!ready) {
      updateFallbackMask(
        "AR 얼굴 추적 모델을 불러오지 못해 고정 필터로 표시합니다.",
      );
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
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.45,
    minTrackingConfidence: 0.45,
  });
  faceMesh.onResults(updateMaskFromFaceMesh);

  return true;
}

function trackFace() {
  if (!filterEnabled || cameraModal.hidden) {
    faceTrackingFrame = null;
    return;
  }

  if (!faceMesh || cameraVideo.readyState < 2) {
    updateFallbackMask();
  } else if (!processingFaceFrame) {
    processingFaceFrame = true;
    faceMesh
      .send({ image: cameraVideo })
      .catch(() => {
        updateFallbackMask(
          "AR 얼굴 추적 중 문제가 생겨 고정 필터로 표시합니다.",
        );
      })
      .finally(() => {
        processingFaceFrame = false;
      });
  }

  faceTrackingFrame = requestAnimationFrame(trackFace);
}

function getFaceLandmarks(landmarks) {
  return {
    forehead: landmarks[10],
    nose: landmarks[1],
    leftCheek: landmarks[234],
    rightCheek: landmarks[454],
  };
}

function getCoverMetrics(previewRect) {
  const videoWidth = cameraVideo.videoWidth || previewRect.width;
  const videoHeight = cameraVideo.videoHeight || previewRect.height;
  const scale = Math.max(
    previewRect.width / videoWidth,
    previewRect.height / videoHeight,
  );
  const width = videoWidth * scale;
  const height = videoHeight * scale;

  return {
    width,
    height,
    offsetX: (previewRect.width - width) / 2,
    offsetY: (previewRect.height - height) / 2,
  };
}

function getPreviewPoint(landmark, coverMetrics) {
  return {
    x: coverMetrics.offsetX + (1 - landmark.x) * coverMetrics.width,
    y: coverMetrics.offsetY + landmark.y * coverMetrics.height,
  };
}

function getVideoPoint(landmark) {
  return {
    x: (1 - landmark.x) * cameraVideo.videoWidth,
    y: landmark.y * cameraVideo.videoHeight,
  };
}

function getMaskBoxFromPoints(points, activeFilter, options = {}) {
  const cheekDistance = Math.abs(points.rightCheek.x - points.leftCheek.x);
  const minWidth = options.minWidth || 0;
  const width = Math.max(
    minWidth,
    cheekDistance * activeFilter.previewWidthScale,
  );
  const height = width / activeFilter.aspectRatio;
  const anchorPoint = points[activeFilter.anchor] || points.nose;

  return {
    x: anchorPoint.x - width * activeFilter.anchorX,
    y: anchorPoint.y - height * activeFilter.anchorY,
    width,
    height,
  };
}

function updateMaskFromFaceMesh(results) {
  const [landmarks] = results.multiFaceLandmarks || [];

  if (!landmarks) {
    updateFallbackMask();
    return;
  }

  const faceLandmarks = getFaceLandmarks(landmarks);
  const previewRect = cameraVideo.getBoundingClientRect();
  const activeFilter = getActiveFilter();
  const coverMetrics = getCoverMetrics(previewRect);
  const previewPoints = Object.fromEntries(
    Object.entries(faceLandmarks).map(([key, landmark]) => [
      key,
      getPreviewPoint(landmark, coverMetrics),
    ]),
  );
  const videoPoints = Object.fromEntries(
    Object.entries(faceLandmarks).map(([key, landmark]) => [
      key,
      getVideoPoint(landmark),
    ]),
  );
  const previewMaskBox = getMaskBoxFromPoints(previewPoints, activeFilter, {
    minWidth: activeFilter.minPreviewWidth,
  });

  lastMaskBox = getMaskBoxFromPoints(videoPoints, activeFilter, {
    minWidth:
      cameraVideo.videoWidth *
      (activeFilter.minPreviewWidth / previewRect.width),
  });

  arMaskImage.style.setProperty("--mask-width", `${previewMaskBox.width}px`);
  arMaskImage.style.setProperty("--mask-height", `${previewMaskBox.height}px`);
  arMaskImage.style.setProperty("--mask-left", `${previewMaskBox.x}px`);
  arMaskImage.style.setProperty("--mask-top", `${previewMaskBox.y}px`);
  cameraMessage.textContent = "";
}

function updateFallbackMask(message = "") {
  const previewRect = cameraVideo.getBoundingClientRect();
  const activeFilter = getActiveFilter();
  const maskWidth = previewRect.width * activeFilter.fallbackWidthRatio;
  const maskHeight = maskWidth / activeFilter.aspectRatio;
  const left = (previewRect.width - maskWidth) / 2;
  const top = previewRect.height * activeFilter.fallbackTopRatio;
  const videoWidth = cameraVideo.videoWidth || previewRect.width;
  const videoHeight = cameraVideo.videoHeight || previewRect.height;
  const captureMaskWidth = videoWidth * activeFilter.fallbackWidthRatio;
  const captureMaskHeight = captureMaskWidth / activeFilter.aspectRatio;

  lastMaskBox = {
    x: (videoWidth - captureMaskWidth) / 2,
    y: videoHeight * activeFilter.fallbackTopRatio,
    width: captureMaskWidth,
    height: captureMaskHeight,
  };

  arMaskImage.style.setProperty("--mask-width", `${maskWidth}px`);
  arMaskImage.style.setProperty("--mask-height", `${maskHeight}px`);
  arMaskImage.style.setProperty("--mask-left", `${left}px`);
  arMaskImage.style.setProperty("--mask-top", `${top}px`);
  cameraMessage.textContent = message;
}

function openStoryImagePicker() {
  stopCameraStream();
  cameraMessage.textContent = "이미지를 선택해주세요.";
  storyImagePicker.click();
}

function goToStoryEditor(dataUrl) {
  sessionStorage.setItem("introstagramStoryImage", dataUrl);
  openStoryModalEditor(dataUrl);
}

function openStoryModalEditor(dataUrl) {
  stopCameraStream();
  cameraModal.hidden = false;
  cameraPanel.classList.add("is-editing");
  modalEditor.hidden = false;
  modalBackgroundImage.src = dataUrl;
}

function resetModalCanvas() {
  modalContext.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
  drawModalBackgroundCover();
}

function drawModalBackgroundCover() {
  const canvasRatio = modalCanvas.width / modalCanvas.height;
  const imageRatio =
    modalBackgroundImage.naturalWidth / modalBackgroundImage.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = modalBackgroundImage.naturalWidth;
  let sourceHeight = modalBackgroundImage.naturalHeight;

  if (imageRatio > canvasRatio) {
    sourceWidth = modalBackgroundImage.naturalHeight * canvasRatio;
    sourceX = (modalBackgroundImage.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = modalBackgroundImage.naturalWidth / canvasRatio;
    sourceY = (modalBackgroundImage.naturalHeight - sourceHeight) / 2;
  }

  modalContext.drawImage(
    modalBackgroundImage,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    modalCanvas.width,
    modalCanvas.height,
  );
}

function getModalCanvasPoint(event) {
  const rect = modalCanvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;

  return {
    x: ((source.clientX - rect.left) / rect.width) * modalCanvas.width,
    y: ((source.clientY - rect.top) / rect.height) * modalCanvas.height,
  };
}

function drawModalLine(point) {
  if (!modalLastPoint) {
    modalLastPoint = point;
  }

  modalContext.save();
  modalContext.lineWidth = Number(modalBrushSize.value);
  modalContext.lineCap = "round";
  modalContext.lineJoin = "round";
  modalContext.globalCompositeOperation =
    modalCurrentTool === "eraser" ? "destination-out" : "source-over";
  modalContext.strokeStyle =
    modalCurrentTool === "eraser" ? "rgba(0, 0, 0, 1)" : modalCurrentColor;
  modalContext.beginPath();
  modalContext.moveTo(modalLastPoint.x, modalLastPoint.y);
  modalContext.lineTo(point.x, point.y);
  modalContext.stroke();
  modalContext.restore();

  modalLastPoint = point;
}

function startModalDrawing(event) {
  event.preventDefault();
  modalDrawing = true;
  modalLastPoint = getModalCanvasPoint(event);
  drawModalLine(modalLastPoint);
}

function keepModalDrawing(event) {
  if (!modalDrawing) {
    return;
  }

  event.preventDefault();
  drawModalLine(getModalCanvasPoint(event));
}

function stopModalDrawing() {
  modalDrawing = false;
  modalLastPoint = null;
}

function saveModalStoryImage() {
  const link = document.createElement("a");
  link.download = "introstagram-story.webp";
  link.href = modalCanvas.toDataURL("image/png");
  link.click();
}

function getPublishedStories() {
  try {
    return JSON.parse(localStorage.getItem(publishedStoriesStorageKey) || "[]");
  } catch (error) {
    return [];
  }
}

function setPublishedStories(stories) {
  localStorage.setItem(publishedStoriesStorageKey, JSON.stringify(stories));
}

function openPublishedStories() {
  const stories = getPublishedStories();

  if (!stories.length) {
    return;
  }

  window.introstagramStoryViewer?.openStoryList(stories, {
    startIndex: stories.length - 1,
    origin: "home",
  });
}

function renderPublishedStoryItem() {
  const stories = getPublishedStories();

  if (!stories.length || !storyList || !firstMemberStoryItem) {
    return;
  }

  if (!publishedStoryItem) {
    publishedStoryItem = document.createElement("button");
    publishedStoryItem.className = "story-item published-story-item";
    publishedStoryItem.type = "button";
    publishedStoryItem.setAttribute("aria-label", "View published story");
    publishedStoryItem.innerHTML = `
      <span class="story-ring">
        <span class="story-avatar">
          <img src="./pages/static/img/introstagram_avatar.webp" alt="" />
        </span>
      </span>
      <span>introstagram team</span>
    `;
    publishedStoryItem.addEventListener("click", openPublishedStories);
  }

  if (!publishedStoryItem.isConnected) {
    firstMemberStoryItem.before(publishedStoryItem);
  }
}

function publishModalStory() {
  const image = modalCanvas.toDataURL("image/png");
  const stories = getPublishedStories();

  stories.push({
    title: "내 스토리",
    text: "",
    image,
    username: "introstagram team",
    avatar: "./pages/static/img/introstagram_avatar.webp",
  });
  setPublishedStories(stories);
  renderPublishedStoryItem();
  closeStoryCamera();
  window.introstagramStoryViewer?.openStoryList(stories, {
    startIndex: stories.length - 1,
    origin: "home",
  });
}

function loadModalEditorImage(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    sessionStorage.setItem("introstagramStoryImage", reader.result);
    modalBackgroundImage.src = reader.result;
  });

  reader.readAsDataURL(file);
}

function getCoverDrawBox(containerWidth, containerHeight, mediaWidth, mediaHeight) {
  const scale = Math.max(
    containerWidth / mediaWidth,
    containerHeight / mediaHeight,
  );
  const width = mediaWidth * scale;
  const height = mediaHeight * scale;

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
}

async function waitForMaskImage() {
  if (!filterEnabled || arMaskImage.hidden || arMaskImage.complete) {
    return;
  }

  if (arMaskImage.decode) {
    await arMaskImage.decode().catch(() => {});
    return;
  }

  await new Promise((resolve) => {
    arMaskImage.addEventListener("load", resolve, { once: true });
    arMaskImage.addEventListener("error", resolve, { once: true });
  });
}

async function captureStoryImage() {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
    cameraMessage.textContent = "카메라 화면이 준비된 뒤 다시 눌러주세요.";
    return;
  }

  await waitForMaskImage();

  const preview = cameraVideo.closest(".story-camera-preview");
  const previewRect = preview.getBoundingClientRect();
  const outputWidth = 720;
  const outputHeight = Math.round(
    outputWidth * (previewRect.height / previewRect.width),
  );
  const logicalWidth = previewRect.width;
  const logicalHeight = previewRect.height;
  const captureCanvas = document.createElement("canvas");
  captureCanvas.width = outputWidth;
  captureCanvas.height = outputHeight;
  const captureContext = captureCanvas.getContext("2d");
  const scaleX = outputWidth / logicalWidth;
  const scaleY = outputHeight / logicalHeight;
  const videoBox = getCoverDrawBox(
    logicalWidth,
    logicalHeight,
    cameraVideo.videoWidth,
    cameraVideo.videoHeight,
  );

  captureContext.scale(scaleX, scaleY);
  captureContext.translate(logicalWidth, 0);
  captureContext.scale(-1, 1);
  captureContext.drawImage(
    cameraVideo,
    logicalWidth - videoBox.x - videoBox.width,
    videoBox.y,
    videoBox.width,
    videoBox.height,
  );
  captureContext.setTransform(1, 0, 0, 1, 0, 0);

  if (filterEnabled && !arMaskImage.hidden && arMaskImage.complete) {
    const maskRect = arMaskImage.getBoundingClientRect();

    captureContext.drawImage(
      arMaskImage,
      (maskRect.left - previewRect.left) * scaleX,
      (maskRect.top - previewRect.top) * scaleY,
      maskRect.width * scaleX,
      maskRect.height * scaleY,
    );
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
cameraCloseButtons.forEach((button) => {
  button.addEventListener("click", closeStoryCamera);
});
fileFallbackButton.addEventListener("click", openStoryImagePicker);
storyImagePicker.addEventListener("change", loadStoryImage);
filterOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectFilter(button.dataset.filterOption);
  });
});
modalBackgroundImage.addEventListener("load", resetModalCanvas);
modalCanvas.addEventListener("mousedown", startModalDrawing);
modalCanvas.addEventListener("mousemove", keepModalDrawing);
modalCanvas.addEventListener("mouseup", stopModalDrawing);
modalCanvas.addEventListener("mouseleave", stopModalDrawing);
modalCanvas.addEventListener("touchstart", startModalDrawing, {
  passive: false,
});
modalCanvas.addEventListener("touchmove", keepModalDrawing, { passive: false });
modalCanvas.addEventListener("touchend", stopModalDrawing);
modalColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modalCurrentColor = button.dataset.modalColor;
    modalCurrentTool = "pen";
    modalColorButtons.forEach((item) => item.classList.remove("active"));
    modalToolButtons.forEach((item) => {
      item.classList.toggle("active", item.dataset.modalTool === "pen");
    });
    button.classList.add("active");
  });
});
modalToolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tool = button.dataset.modalTool;

    if (tool === "clear") {
      resetModalCanvas();
      return;
    }

    modalCurrentTool = tool;
    modalToolButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  });
});
modalSaveButtons.forEach((button) => {
  button.addEventListener("click", saveModalStoryImage);
});
modalPublishButtons.forEach((button) => {
  button.addEventListener("click", publishModalStory);
});
modalImagePicker.addEventListener("change", loadModalEditorImage);
renderPublishedStoryItem();
