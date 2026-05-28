const canvas = document.querySelector("#storyCanvas");
const context = canvas.getContext("2d");
const brushSize = document.querySelector("#brushSize");
const colorButtons = document.querySelectorAll("[data-color]");
const saveButtons = document.querySelectorAll("[data-save]");
const toolButtons = document.querySelectorAll("[data-tool]");
const backgroundImage = new Image();

let currentColor = "#ffffff";
let currentTool = "pen";
let drawing = false;
let lastPoint = null;

backgroundImage.src = "../img/story-background.svg";
backgroundImage.addEventListener("load", resetCanvas);

function resetCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;

  return {
    x: ((source.clientX - rect.left) / rect.width) * canvas.width,
    y: ((source.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function drawLine(point) {
  if (!lastPoint) {
    lastPoint = point;
  }

  context.save();
  context.lineWidth = Number(brushSize.value);
  context.lineCap = "round";
  context.lineJoin = "round";

  if (currentTool === "eraser") {
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(0, 0, 0, 1)";
  } else {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = currentColor;
  }

  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();
  context.restore();

  lastPoint = point;
}

function startDrawing(event) {
  event.preventDefault();
  drawing = true;
  lastPoint = getCanvasPoint(event);
  drawLine(lastPoint);
}

function keepDrawing(event) {
  if (!drawing) {
    return;
  }

  event.preventDefault();
  drawLine(getCanvasPoint(event));
}

function stopDrawing() {
  drawing = false;
  lastPoint = null;
}

function saveImage() {
  const link = document.createElement("a");
  link.download = "introstagram-story.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", keepDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", keepDrawing, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentColor = button.dataset.color;
    currentTool = "pen";
    colorButtons.forEach((item) => item.classList.remove("active"));
    toolButtons.forEach((item) => item.classList.toggle("active", item.dataset.tool === "pen"));
    button.classList.add("active");
  });
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tool = button.dataset.tool;

    if (tool === "clear") {
      resetCanvas();
      return;
    }

    currentTool = tool;
    toolButtons.forEach((item) => item.classList.toggle("active", item === button));
  });
});

saveButtons.forEach((button) => {
  button.addEventListener("click", saveImage);
});
