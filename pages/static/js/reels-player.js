const reelsVideo = document.querySelector(".reels-video");
const reelsStage = document.querySelector(".reels-stage");
const reelsSoundButton = document.querySelector("[data-reels-sound]");

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

reelsStage?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    return;
  }

  toggleReelsSound();
});

playReelsWithSound();
