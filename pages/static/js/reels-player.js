const reelsVideo = document.querySelector(".reels-video");
const reelsStage = document.querySelector(".reels-stage");
const reelsSoundButton = document.querySelector("[data-reels-sound]");
const reelsCaption = document.querySelector(".reels-copy p");
const reelsLikes = document.querySelector("[data-reels-likes]");

const reelsItems = [
  {
    src: "../static/video/reels-1.mp4",
    caption: "KOSA 교육생 김햄찌 VLOG 1편",
    likes: "10K",
  },
  {
    src: "../static/video/reels-2.mp4",
    caption: "KOSA 교육생 김햄찌 VLOG 2편",
    likes: "12K",
  },
];

let activeReelIndex = 0;
let isSwitchingReel = false;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeMoved = false;

const reelTransitionDelay = 240;

function updateSoundButton() {
  if (!reelsSoundButton || !reelsVideo) {
    return;
  }

  reelsSoundButton.hidden = !reelsVideo.muted;
  reelsSoundButton.setAttribute(
    "aria-label",
    reelsVideo.muted ? "Turn sound on" : "Mute sound",
  );
}

async function playReelsWithSound() {
  if (!reelsVideo) {
    return;
  }

  reelsVideo.muted = false;
  reelsVideo.volume = 1;

  try {
    await reelsVideo.play();
  } catch (error) {
    reelsVideo.muted = true;
    await reelsVideo.play().catch(() => {});
  }

  updateSoundButton();
}

async function toggleReelsSound() {
  reelsVideo.muted = !reelsVideo.muted;
  reelsVideo.volume = 1;
  await reelsVideo.play().catch(() => {});
  updateSoundButton();
}

function isReelsControl(target) {
  return target.closest("a, button");
}

function clearReelTransitionClasses() {
  reelsStage?.classList.remove(
    "reels-slide-exit-up",
    "reels-slide-exit-down",
    "reels-slide-enter-up",
    "reels-slide-enter-down",
    "reels-slide-enter-active",
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

async function animateReelExit(direction) {
  if (!reelsStage) {
    return;
  }

  clearReelTransitionClasses();
  reelsStage.classList.add(
    direction > 0 ? "reels-slide-exit-up" : "reels-slide-exit-down",
  );
  await wait(reelTransitionDelay);
}

async function animateReelEnter(direction) {
  if (!reelsStage) {
    return;
  }

  clearReelTransitionClasses();
  reelsStage.classList.add(
    direction > 0 ? "reels-slide-enter-up" : "reels-slide-enter-down",
  );
  await waitForFrame();
  reelsStage.classList.add("reels-slide-enter-active");
  await wait(reelTransitionDelay);
  clearReelTransitionClasses();
}

async function showReel(index, direction) {
  if (!reelsVideo) {
    return;
  }

  const nextIndex = Math.max(0, Math.min(index, reelsItems.length - 1));

  if (nextIndex === activeReelIndex || isSwitchingReel) {
    return;
  }

  isSwitchingReel = true;

  try {
    activeReelIndex = nextIndex;
    const nextReel = reelsItems[activeReelIndex];

    await animateReelExit(direction);

    reelsVideo.src = nextReel.src;
    reelsVideo.currentTime = 0;

    if (reelsCaption) {
      reelsCaption.textContent = nextReel.caption;
    }

    if (reelsLikes) {
      reelsLikes.textContent = nextReel.likes;
    }

    try {
      await reelsVideo.play();
    } catch (error) {
      reelsVideo.muted = true;
      await reelsVideo.play().catch(() => {});
    }

    updateSoundButton();
    await animateReelEnter(direction);
  } finally {
    clearReelTransitionClasses();
    isSwitchingReel = false;
  }
}

function moveReel(direction) {
  showReel(activeReelIndex + direction, direction);
}

function handleSwipeEnd(clientX, clientY) {
  const deltaX = clientX - swipeStartX;
  const deltaY = clientY - swipeStartY;
  const isVerticalSwipe =
    Math.abs(deltaY) > 60 && Math.abs(deltaY) > Math.abs(deltaX) * 1.4;

  swipeStartX = 0;
  swipeStartY = 0;

  if (!isVerticalSwipe) {
    return;
  }

  swipeMoved = true;
  moveReel(deltaY < 0 ? 1 : -1);
}

reelsSoundButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleReelsSound();
});

reelsStage?.addEventListener("click", (event) => {
  if (swipeMoved) {
    swipeMoved = false;
    return;
  }

  if (isReelsControl(event.target)) {
    return;
  }

  toggleReelsSound();
});

reelsStage?.addEventListener(
  "touchstart",
  (event) => {
    if (isReelsControl(event.target)) {
      return;
    }

    const touch = event.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeMoved = false;
  },
  { passive: true },
);

reelsStage?.addEventListener("touchend", (event) => {
  if (!swipeStartY || isReelsControl(event.target)) {
    return;
  }

  const touch = event.changedTouches[0];
  handleSwipeEnd(touch.clientX, touch.clientY);
});

reelsStage?.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || isReelsControl(event.target)) {
    return;
  }

  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
  swipeMoved = false;
});

reelsStage?.addEventListener("pointerup", (event) => {
  if (event.pointerType === "touch" || !swipeStartY) {
    return;
  }

  handleSwipeEnd(event.clientX, event.clientY);
});

playReelsWithSound();
