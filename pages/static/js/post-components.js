const defaultPostData = {
  user: {
    name: "dogeonwoo",
    meta: "도건우",
    avatar: "./pages/static/img/member-1/profile/dogeonwoo-profile.webp",
  },
  caption:
    "게시글 설명을 여기에 작성하세요. 사진은 post-1-1.webp, post-1-2.webp처럼 교체하면 됩니다.",
  commentsLabel: "댓글 1개 모두 보기",
  slides: [
    {
      image: "./pages/static/img/member-1/posts/post-1-1.webp",
      fallback: "./pages/static/img/post-slide-1.svg",
    },
  ],
};

const postLikesStorageKey = "introstagramPostLikes";

function getPostLikes() {
  try {
    return JSON.parse(localStorage.getItem(postLikesStorageKey) || "{}");
  } catch (error) {
    return {};
  }
}

function setPostLikes(likes) {
  try {
    localStorage.setItem(postLikesStorageKey, JSON.stringify(likes));
  } catch (error) {
    console.warn("좋아요 상태를 저장하지 못했습니다.", error);
  }
}

function normalizePostLikeKey(value) {
  return String(value || "")
    .replace(window.location.origin, "")
    .replace(/^.*?\/pages\//, "pages/")
    .replace(/^\.\//, "")
    .replace(/^\//, "");
}

function getCurrentPostPathKey() {
  const match = window.location.pathname.match(
    /pages\/member\/\d+\/posts\/post-\d+\.html$/,
  );

  return match?.[0] || "";
}

function getPostLikeKey(data) {
  const explicitKey = data.likeKey || data.id || getCurrentPostPathKey();

  if (explicitKey) {
    return normalizePostLikeKey(explicitKey);
  }

  return normalizePostLikeKey(
    `${data.user?.name || "post"}:${data.slides?.[0]?.image || ""}`,
  );
}

function isPostLiked(postKey) {
  return Boolean(getPostLikes()[postKey]);
}

function setPostLiked(postKey, liked) {
  const likes = getPostLikes();
  likes[postKey] = Boolean(liked);
  setPostLikes(likes);
}

function updatePostLikeButton(button, liked) {
  button.classList.toggle("is-liked", liked);
  button.setAttribute("aria-pressed", String(liked));
  button.setAttribute("aria-label", liked ? "Unlike" : "Like");
}

function setupPostLikeButton(card, data) {
  const likeButton = card.querySelector(
    'button[aria-label="Like"], .post-like-button',
  );

  if (!likeButton) {
    return;
  }

  const postKey = getPostLikeKey(data);
  likeButton.type = "button";
  likeButton.dataset.postLikeButton = "";
  likeButton.dataset.postLikeKey = postKey;
  likeButton.classList.add("post-like-button");
  updatePostLikeButton(likeButton, isPostLiked(postKey));

  if (likeButton.dataset.likeBound === "true") {
    return;
  }

  likeButton.dataset.likeBound = "true";
  likeButton.addEventListener("click", () => {
    const currentPostKey = likeButton.dataset.postLikeKey;
    const liked = !isPostLiked(currentPostKey);
    setPostLiked(currentPostKey, liked);
    updatePostLikeButton(likeButton, liked);
  });
}

function getPostPreviewImage(data, activeIndex) {
  const slide = data.slides?.[activeIndex] || data.slides?.[0] || {};
  return slide.image || slide.fallback || "";
}

function getPostCommentKey(card, data) {
  return (
    data.commentKey ||
    card.querySelector("[data-comments-open][data-comments-key]")?.dataset
      .commentsKey ||
    getPostLikeKey(data)
  );
}

function getPostCommentPreviewImage(card, data, activeIndex) {
  return (
    data.commentPreviewImage ||
    card.querySelector("[data-comments-open][data-comments-preview-image]")
      ?.dataset.commentsPreviewImage ||
    getPostPreviewImage(data, activeIndex)
  );
}

function setupPostCommentContext(card, data, activeIndex) {
  const postKey = getPostCommentKey(card, data);
  const previewImage = getPostCommentPreviewImage(card, data, activeIndex);
  const commentsOpenButtons = card.querySelectorAll("[data-comments-open]");
  const commentsLabels = card.querySelectorAll("[data-comments-label]");

  window.introstagramCommentContexts =
    window.introstagramCommentContexts || {};
  window.introstagramCommentContexts[postKey] = {
    postKey,
    previewImage,
    userName: data.user?.name || "introstagram_team",
    userAvatar: data.user?.avatar || "",
  };

  card.dataset.postKey = postKey;
  card.dataset.postPreviewImage = previewImage;

  commentsOpenButtons.forEach((button) => {
    button.dataset.commentsKey = postKey;
    button.dataset.commentsPreviewImage = previewImage;
  });

  commentsLabels.forEach((label) => {
    label.dataset.commentsKey = postKey;
    label.setAttribute("data-comments-count-label", "");
  });

  window.introstagramUpdateCommentsCount?.(postKey);
}

function createPostHeader(user) {
  const header = document.createElement("header");
  header.className = "post-header";
  const avatarMarkup = user.avatar
    ? `<img src="${user.avatar}" alt="" />`
    : "";
  header.innerHTML = `
    <div class="profile-dot">${avatarMarkup}</div>
    <div class="post-meta">
      <strong>${user.name}</strong>
      <span>${user.meta}</span>
    </div>
    <button class="more-button" type="button" aria-label="More options">...</button>
  `;

  return header;
}

function createPostVisual(slides, activeIndex) {
  const slide = slides[activeIndex];
  const hasOverlay = Boolean(slide.label || slide.title || slide.description);
  const isCarousel = slides.length > 1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < slides.length - 1;
  const visual = document.createElement("section");
  visual.className = "post-visual";
  visual.setAttribute("aria-label", "Team project image slide");
  visual.innerHTML = `
    <img class="post-slide-image" src="${slide.image}" alt="" onerror="this.onerror=null; this.src='${slide.fallback || slide.image}'" />
    ${isCarousel ? `<span class="slide-count">${activeIndex + 1}/${slides.length}</span>` : ""}
    ${
      isCarousel && canGoPrev
        ? `<button class="slide-button slide-button-prev" type="button" aria-label="Previous image">
            <span class="slide-button-icon slide-prev-icon"></span>
          </button>`
        : ""
    }
    ${
      isCarousel && canGoNext
        ? `<button class="slide-button slide-button-next" type="button" aria-label="Next image">
            <span class="slide-button-icon slide-next-icon"></span>
          </button>`
        : ""
    }
    ${
      hasOverlay
        ? `<div class="visual-content">
            ${slide.label ? `<p class="project-label">${slide.label}</p>` : ""}
            ${slide.title ? `<h2>${slide.title}</h2>` : ""}
            ${slide.description ? `<p>${slide.description}</p>` : ""}
          </div>`
        : ""
    }
  `;

  return visual;
}

function createPaginationDots(slides, activeIndex, renderAtIndex) {
  const fragment = document.createDocumentFragment();

  if (slides.length <= 1) {
    return fragment;
  }

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = index === activeIndex ? "active" : "";
    dot.setAttribute("aria-label", `${index + 1}번째 이미지 보기`);
    dot.addEventListener("click", () => {
      renderAtIndex(index);
    });
    fragment.append(dot);
  });

  return fragment;
}

function createPostActions() {
  const actions = document.createElement("section");
  actions.className = "post-actions";
  actions.setAttribute("aria-label", "Post actions");
  actions.innerHTML = `
    <div class="action-group">
      <button class="icon-button post-like-button" type="button" aria-label="Like" aria-pressed="false" data-post-like-button>
        <span class="comment-like-icon"></span>
      </button>
      <button class="icon-button" type="button" aria-label="Comment" data-comments-open>
        <span class="icon comment"></span>
      </button>
      <button class="icon-button" aria-label="Share">
        <span class="icon send"></span>
      </button>
    </div>
    <div class="pagination-dots" aria-hidden="true" data-post-pagination-root></div>
    <button class="icon-button" aria-label="Save">
      <span class="icon bookmark"></span>
    </button>
  `;

  return actions;
}

function createCaption() {
  const caption = document.createElement("section");
  caption.className = "caption";
  caption.innerHTML = `
    <p data-post-caption></p>
    <button
      type="button"
      aria-label="Comment"
      data-comments-open
      data-comments-label
      data-comments-count-label
    >
      댓글 1개 모두 보기
    </button>
  `;

  return caption;
}

function renderPostCard(card, data) {
  let currentSlideIndex = 0;
  const headerRoot = card.querySelector("[data-post-header-root]");
  const visualRoot = card.querySelector("[data-post-visual-root]");
  const paginationRoot = card.querySelector("[data-post-pagination-root]");
  const captionRoot = card.querySelector("[data-post-caption]");
  const commentsLabelRoot = card.querySelector("[data-comments-label]");

  function renderAtIndex(index) {
    currentSlideIndex = index;
    render();
  }

  function moveSlide(direction) {
    const nextSlideIndex = currentSlideIndex + direction;

    if (nextSlideIndex < 0 || nextSlideIndex >= data.slides.length) {
      return;
    }

    renderAtIndex(nextSlideIndex);
  }

  function render() {
    headerRoot.replaceChildren(createPostHeader(data.user));
    visualRoot.replaceChildren(createPostVisual(data.slides, currentSlideIndex));
    paginationRoot.replaceChildren(
      createPaginationDots(data.slides, currentSlideIndex, renderAtIndex),
    );

    visualRoot
      .querySelector(".slide-button-prev")
      ?.addEventListener("click", () => moveSlide(-1));
    visualRoot
      .querySelector(".slide-button-next")
      ?.addEventListener("click", () => moveSlide(1));

    if (captionRoot) {
      captionRoot.innerHTML = `<strong>${data.user.name}</strong> ${data.caption || ""}`;
    }

    if (commentsLabelRoot && data.commentsLabel) {
      commentsLabelRoot.textContent = data.commentsLabel;
    }

    setupPostCommentContext(card, data, currentSlideIndex);
    setupPostLikeButton(card, data);
  }

  render();
}

function createPostCard(data, options = {}) {
  const card = document.createElement("article");
  card.className = options.className || "app-layout-post post-card";
  card.innerHTML = `
    <div data-post-header-root></div>
    <div data-post-visual-root></div>
  `;
  card.append(createPostActions());
  card.append(createCaption());
  renderPostCard(card, data);

  return card;
}

function renderLegacyPost() {
  const legacyCard = document.querySelector("#postHeaderRoot")?.closest(".post-card");

  if (!legacyCard) {
    return;
  }

  const postData = window.introstagramPostData || defaultPostData;
  legacyCard.querySelector("#postHeaderRoot")?.setAttribute("data-post-header-root", "");
  legacyCard.querySelector("#postVisualRoot")?.setAttribute("data-post-visual-root", "");
  legacyCard.querySelector("#postPaginationRoot")?.setAttribute("data-post-pagination-root", "");
  renderPostCard(legacyCard, postData);
}

window.introstagramPostComponents = {
  createPostCard,
  renderPostCard,
};

renderLegacyPost();
