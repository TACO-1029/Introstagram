const defaultPostData = {
  user: {
    name: "dogeonwoo",
    meta: "도건우",
    avatar: "./pages/static/img/member-1/profile/dogeonwoo-profile.png",
  },
  caption:
    "게시글 설명을 여기에 작성하세요. 사진은 post-1-1.jpg, post-1-2.jpg처럼 교체하면 됩니다.",
  commentsLabel: "댓글 1개 모두 보기",
  slides: [
    {
      image: "./pages/static/img/member-1/posts/post-1-1.jpg",
      fallback: "./pages/static/img/post-slide-1.svg",
    },
  ],
};

const postData = window.introstagramPostData || defaultPostData;

let currentSlideIndex = 0;

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
  const visual = document.createElement("section");
  visual.className = "post-visual";
  visual.setAttribute("aria-label", "Team project image slide");
  visual.innerHTML = `
    <img class="post-slide-image" src="${slide.image}" alt="" onerror="this.onerror=null; this.src='${slide.fallback || slide.image}'" />
    ${isCarousel ? `<span class="slide-count">${activeIndex + 1}/${slides.length}</span>` : ""}
    ${
      isCarousel
        ? `<button class="slide-button slide-button-prev" type="button" aria-label="Previous image">
            <span class="slide-button-icon slide-prev-icon"></span>
          </button>
          <button class="slide-button slide-button-next" type="button" aria-label="Next image">
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

  if (isCarousel) {
    visual.querySelector(".slide-button-prev").addEventListener("click", () => {
      moveSlide(-1);
    });
    visual.querySelector(".slide-button-next").addEventListener("click", () => {
      moveSlide(1);
    });
  }

  return visual;
}

function createPaginationDots(slides, activeIndex) {
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
      currentSlideIndex = index;
      renderPost();
    });
    fragment.append(dot);
  });

  return fragment;
}

function moveSlide(direction) {
  const slideCount = postData.slides.length;
  currentSlideIndex = (currentSlideIndex + direction + slideCount) % slideCount;
  renderPost();
}

function renderPost() {
  const headerRoot = document.querySelector("#postHeaderRoot");
  const visualRoot = document.querySelector("#postVisualRoot");
  const paginationRoot = document.querySelector("#postPaginationRoot");
  const captionRoot = document.querySelector("[data-post-caption]");
  const commentsLabelRoot = document.querySelector("[data-comments-label]");

  headerRoot.replaceChildren(createPostHeader(postData.user));
  visualRoot.replaceChildren(createPostVisual(postData.slides, currentSlideIndex));
  paginationRoot.replaceChildren(createPaginationDots(postData.slides, currentSlideIndex));

  if (captionRoot) {
    captionRoot.innerHTML = `<strong>${postData.user.name}</strong> ${postData.caption || ""}`;
  }

  if (commentsLabelRoot && postData.commentsLabel) {
    commentsLabelRoot.textContent = postData.commentsLabel;
  }
}

renderPost();
