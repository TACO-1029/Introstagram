const highlightStories = window.introstagramHighlightStories || {};
const viewer = document.querySelector("#storyViewer");
const viewerImage = viewer?.querySelector(".story-viewer-image");
const viewerTitle = viewer?.querySelector(".story-viewer-copy strong");
const viewerText = viewer?.querySelector(".story-viewer-copy p");
const progressRoot = viewer?.querySelector(".story-progress");
const storyHeader = viewer?.querySelector(".story-viewer-header");
const storyHeaderAvatar = viewer?.querySelector(".story-viewer-avatar");
const storyHeaderName = viewer?.querySelector(".story-viewer-header strong");
const storyPrevButton = viewer?.querySelector(".story-nav-prev");
const storyNextButton = viewer?.querySelector(".story-nav-next");
const storyCloseButton = viewer?.querySelector(".story-close");
const storyLink = viewer?.querySelector("[data-story-link]");
const storyLinkLabel = viewer?.querySelector("[data-story-link-label]");
let storyTimer = null;
let activeStories = [];
let activeStoryIndex = 0;
let activeStoryOrigin = "";
let activeStoryProfileUrl = "";

const defaultStoryUsername = storyHeaderName?.textContent || "";
const defaultStoryAvatarMarkup = storyHeaderAvatar?.innerHTML || "";

function resolveStoryAssetUrl(src) {
  if (!src) return "";

  return new URL(src, window.location.href).href;
}

function renderProgressBars() {
  progressRoot.style.gridTemplateColumns = `repeat(${activeStories.length}, 1fr)`;
  progressRoot.replaceChildren(...activeStories.map(() => document.createElement("span")));
}

function updateStoryControls() {
  if (!storyPrevButton || !storyNextButton) return;
  storyPrevButton.hidden = activeStoryIndex <= 0;
  storyNextButton.hidden = activeStoryIndex >= activeStories.length - 1;
}

function updateStoryLink(story) {
  if (!storyLink) return;

  if (story.linkUrl) {
    storyLink.href = story.linkUrl;
    storyLink.hidden = false;

    if (storyLinkLabel) {
      storyLinkLabel.textContent = story.linkLabel || "LINK";
    }

    return;
  }

  storyLink.hidden = true;
  storyLink.removeAttribute("href");
}

function renderStory() {
  const story = activeStories[activeStoryIndex];
  const progressBars = Array.from(progressRoot.querySelectorAll("span"));
  viewerImage.replaceChildren();

  if (story.video) {
    viewerImage.style.removeProperty("--story-image");
    const video = document.createElement("video");
    video.className = "story-viewer-video";
    video.src = resolveStoryAssetUrl(story.video);
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    viewerImage.append(video);
  } else {
    viewerImage.style.setProperty(
      "--story-image",
      `url('${resolveStoryAssetUrl(story.image)}')`,
    );
  }

  viewerImage.setAttribute("aria-label", story.title);
  if (storyHeaderAvatar) {
    storyHeaderAvatar.innerHTML = story.avatar
      ? `<img src="${resolveStoryAssetUrl(story.avatar)}" alt="" />`
      : defaultStoryAvatarMarkup;
  }

  if (storyHeaderName) {
    storyHeaderName.textContent = story.username || defaultStoryUsername;
  }

  viewerTitle.textContent = story.title || "";
  viewerText.textContent = story.text || "";
  updateStoryLink(story);
  progressBars.forEach((bar, index) => {
    bar.classList.toggle("done", index < activeStoryIndex);
    bar.classList.toggle("active", index === activeStoryIndex);
  });
  updateStoryControls();
}

function closeStory() {
  viewer.setAttribute("aria-hidden", "true");
  clearInterval(storyTimer);
  viewerImage.replaceChildren();
  viewerImage.style.removeProperty("--story-image");
  activeStoryOrigin = "";
  activeStoryProfileUrl = "";
}

function startStoryTimer() {
  clearInterval(storyTimer);
  storyTimer = setInterval(() => {
    moveStory(1, { closeAtEnd: true });
  }, 5000);
}

function moveStory(direction, options = {}) {
  const nextStoryIndex = activeStoryIndex + direction;
  if (nextStoryIndex < 0) return;

  if (nextStoryIndex >= activeStories.length) {
    if (options.closeAtEnd) closeStory();
    return;
  }

  activeStoryIndex = nextStoryIndex;
  renderStory();

  if (!options.closeAtEnd) {
    startStoryTimer();
  }
}

function getDefaultStoryOrigin() {
  return document.body.classList.contains("member-body") ? "member" : "home";
}

function startStory(highlightName, trigger) {
  const stories = highlightStories[highlightName] || [];

  openStoryList(stories, {
    origin: trigger?.dataset.storyOrigin || getDefaultStoryOrigin(),
    profileUrl:
      trigger?.dataset.profileUrl ||
      trigger?.getAttribute("href") ||
      stories[0]?.profileUrl ||
      "",
  });
}

function openStoryList(stories, options = {}) {
  activeStories = stories || [];
  if (!activeStories.length || !viewer) return;
  activeStoryIndex = Math.min(
    Math.max(0, options.startIndex || 0),
    activeStories.length - 1,
  );
  activeStoryOrigin = options.origin || getDefaultStoryOrigin();
  activeStoryProfileUrl =
    options.profileUrl || activeStories[0].profileUrl || "";
  viewer.setAttribute("aria-hidden", "false");
  renderProgressBars();
  renderStory();
  startStoryTimer();
}

function handleStoryHeaderClick() {
  if (activeStoryOrigin === "member") {
    closeStory();
    return;
  }

  if (activeStoryOrigin === "home" && activeStoryProfileUrl) {
    window.location.href = activeStoryProfileUrl;
  }
}

if (viewer && viewerImage && viewerTitle && viewerText && progressRoot) {
  if (storyHeader) {
    storyHeader.tabIndex = 0;
    storyHeader.setAttribute("role", "button");
  }

  document.querySelectorAll("[data-highlight]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      startStory(button.dataset.highlight, button);
    });
  });
  storyHeader?.addEventListener("click", handleStoryHeaderClick);
  storyHeader?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStoryHeaderClick();
    }
  });
  storyPrevButton?.addEventListener("click", () => moveStory(-1));
  storyNextButton?.addEventListener("click", () => moveStory(1));
  storyCloseButton?.addEventListener("click", closeStory);
  storyLink?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) closeStory();
  });

  window.introstagramStoryViewer = {
    openStoryList,
    startStory,
  };
}
