const postData = {
  user: {
    name: "introstagram_team",
    meta: "Team Intro, Static Web Project",
  },
  slides: [
    {
      image: "./img/post-slide-1.svg",
      label: "HDF Team Project",
      title: "팀소개와 개인소개를 담은 정적 웹페이지",
      description: "상단 스토리에서 팀원별 개인 페이지로 이동합니다.",
    },
    {
      image: "./img/post-slide-2.svg",
      label: "Static UI",
      title: "인스타그램 화면을 닮은 인터페이스",
      description: "스토리, 피드, 프로필 페이지를 정적 문서로 구성했습니다.",
    },
    {
      image: "./img/post-slide-3.svg",
      label: "Canvas Story",
      title: "캔버스로 만드는 나만의 스토리",
      description: "이미지 위에 직접 그림을 그리고 PNG로 저장할 수 있습니다.",
    },
  ],
};

let currentSlideIndex = 0;

function createPostHeader(user) {
  const header = document.createElement("header");
  header.className = "post-header";
  header.innerHTML = `
    <div class="profile-dot"></div>
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
  const visual = document.createElement("section");
  visual.className = "post-visual";
  visual.setAttribute("aria-label", "Team project image slide");
  visual.innerHTML = `
    <img class="post-slide-image" src="${slide.image}" alt="" />
    <span class="slide-count">${activeIndex + 1}/${slides.length}</span>
    <button class="slide-button slide-button-prev" type="button" aria-label="Previous image">
      <span class="slide-button-icon slide-prev-icon"></span>
    </button>
    <button class="slide-button slide-button-next" type="button" aria-label="Next image">
      <span class="slide-button-icon slide-next-icon"></span>
    </button>
    <div class="visual-content">
      <p class="project-label">${slide.label}</p>
      <h2>${slide.title}</h2>
      <p>${slide.description}</p>
    </div>
  `;

  visual.querySelector(".slide-button-prev").addEventListener("click", () => {
    moveSlide(-1);
  });
  visual.querySelector(".slide-button-next").addEventListener("click", () => {
    moveSlide(1);
  });

  return visual;
}

function createPaginationDots(slides, activeIndex) {
  const fragment = document.createDocumentFragment();

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

  headerRoot.replaceChildren(createPostHeader(postData.user));
  visualRoot.replaceChildren(createPostVisual(postData.slides, currentSlideIndex));
  paginationRoot.replaceChildren(createPaginationDots(postData.slides, currentSlideIndex));
}

renderPost();
