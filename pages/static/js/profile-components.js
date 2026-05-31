const accountProfile = {
  username: "introstagram team",
  handle: "introstagram team",
  avatarSrc: "../static/img/introstagram_avatar.webp",
  stats: [
    { label: "게시물", value: "0" },
    { label: "팔로워", value: "4" },
    { label: "팔로우", value: "4" },
  ],
  bioLines: [""],
  link: "",
  highlights: [
    { label: "projects", src: "../static/img/introstagram_avatar.webp" },
  ],
};

const profileConnectionMembers = [
  {
    username: "dogeonwoo",
    name: "도건우",
    avatarSrc: "../static/img/member-1/profile/dogeonwoo-profile.webp",
    href: "../member/1/index.html",
  },
  {
    username: "member_two",
    name: "Member 2",
    avatarSrc: "../static/img/introstagram_avatar.webp",
    href: "../member/2/index.html",
  },
  {
    username: "jaewonwi",
    name: "위재원",
    avatarSrc: "../static/img/member-3/profile/jaewon-profile.webp",
    href: "../member/3/index.html",
  },
  {
    username: "choiwoojin",
    name: "최우진",
    avatarSrc: "../static/img/member-4/profile/woojin_profile.webp",
    href: "../member/4/index.html",
  },
];

function getProfileConnectionType(label) {
  if (label === "팔로워") {
    return "followers";
  }

  if (label === "팔로우") {
    return "following";
  }

  return "";
}

function getProfileConnectionTitle(type) {
  return type === "following" ? "팔로우" : "팔로워";
}

function getProfileStatAttributes(stat) {
  const connectionType = getProfileConnectionType(stat.label);

  if (!connectionType) {
    return "";
  }

  return ` class="account-profile-stat-trigger" role="button" tabindex="0" data-profile-connections-open="${connectionType}" aria-label="${stat.label} 목록 보기"`;
}

function renderProfileHeader(profile) {
  return `
    <header class="account-profile-header">
      <button class="account-profile-icon-button" type="button" aria-label="Settings">

      </button>
      <button class="account-profile-selector" type="button" aria-label="Switch account">
        <strong>${profile.username}</strong>
        <span class="account-profile-chevron"></span>
      </button>
    </header>
  `;
}

function renderProfileHero(profile) {
  const statsMarkup = profile.stats
    .map(
      (stat) => `
        <div${getProfileStatAttributes(stat)}>
          <strong>${stat.value}</strong>
          <span>${stat.label}</span>
        </div>
      `,
    )
    .join("");
  const desktopStatsMarkup = profile.stats
    .map(
      (stat) => `
        <div${getProfileStatAttributes(stat)}>
          <dt>${stat.label}</dt>
          <dd>${stat.value}</dd>
        </div>
      `,
    )
    .join("");
  const bioMarkup = profile.bioLines
    .filter(Boolean)
    .map((line) => `<span>${line}</span>`)
    .join("");
  const linkMarkup = profile.link ? `<a href="#">🔗 ${profile.link}</a>` : "";

  return `
    <section class="account-profile-hero profile-hero" aria-label="Profile summary">
      <div class="account-profile-avatar-wrap">
        <img class="account-profile-avatar" src="${profile.avatarSrc}" alt="" />
      </div>
      <div class="profile-info account-profile-info">
        <div class="profile-title-row account-profile-title-row">
          <h1>${profile.username}</h1>
          <button class="btn btn-light profile-button" type="button">
            프로필 편집
          </button>
          <button class="btn btn-light profile-button web-only" type="button">
            보관함 보기
          </button>
        </div>
        <div class="account-profile-mobile-summary">
          <h1>${profile.username}</h1>
          <div class="account-profile-stats">
            ${statsMarkup}
          </div>
        </div>
        <dl class="profile-stats account-profile-desktop-stats">
          ${desktopStatsMarkup}
        </dl>
        <div class="profile-bio account-profile-bio">
          <strong>${profile.username}</strong>
          ${bioMarkup}
          ${linkMarkup}
          <span>@ ${profile.handle}</span>
        </div>
      </div>
    </section>
  `;
}

function renderProfileActions() {
  return `
    <section class="mobile-actions account-profile-actions" aria-label="Profile actions">
      <button type="button">프로필 편집</button>
      <button type="button">보관함 보기</button>
      <button type="button">⌄</button>
    </section>
  `;
}

function renderProfileHighlights(profile) {
  const highlightMarkup = profile.highlights
    .map(
      (highlight) => `
        <a class="highlight-item account-highlight" href="#">
          <span class="highlight-dot account-highlight-photo">
            <img src="${highlight.src}" alt="" />
          </span>
          <strong>${highlight.label}</strong>
        </a>
      `,
    )
    .join("");

  return `
    <nav class="highlight-list account-highlight-list" aria-label="Profile highlights">
      ${highlightMarkup}
    </nav>
  `;
}

function renderProfileTabs() {
  return `
    <nav class="profile-tabs" aria-label="Profile content tabs">
      <a class="active" href="#"><span class="grid-icon"></span><span>게시물</span></a>
    </nav>
  `;
}

function renderProfilePostGrid() {
  return `
    <section class="post-grid" aria-label="Member 1 posts">
      <a class="grid-tile tile-a" href="#"><span>UI</span></a>
      <a class="grid-tile tile-b" href="#"><span>HTML</span></a>
      <a class="grid-tile tile-c" href="#"><span>CSS</span></a>
      <a class="grid-tile tile-d" href="#"><span>Team</span></a>
      <a class="grid-tile tile-e" href="#"><span>Intro</span></a>
      <a class="grid-tile tile-f" href="#"><span>Web</span></a>
    </section>
  `;
}

function renderProfileBottomNav(profile) {
  return `
    <nav class="app-layout-footer bottom-nav" aria-label="Main navigation">
      <a href="../../index.html" aria-label="Home"><span class="icon home"></span></a>
      <a href="../reels/index.html" aria-label="Reels"><span class="icon play-square"></span></a>
      <a href="../directmessage/index.html" aria-label="Direct messages"><span class="icon paper-plane-notification"></span></a>
      <a href="../location/index.html" aria-label="Activity">
        <span class="icon search"></span>
      </a>
      <a class="active" href="./index.html" aria-label="Profile">
        <img class="nav-profile-avatar" src="${profile.avatarSrc}" alt="" />
      </a>
    </nav>
  `;
}

function renderProfileConnectionsModal() {
  return `
    <section
      class="account-connections-modal"
      data-profile-connections-modal
      aria-hidden="true"
    >
      <div
        class="account-connections-backdrop"
        data-profile-connections-close
      ></div>
      <section
        class="account-connections-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accountConnectionsTitle"
      >
        <header class="account-connections-header">
          <span></span>
          <h2 id="accountConnectionsTitle">팔로워</h2>
          <button
            class="account-connections-close"
            type="button"
            data-profile-connections-close
            aria-label="닫기"
          >
            ×
          </button>
        </header>
        <label class="account-connections-search">
          <span class="icon search" aria-hidden="true"></span>
          <input
            type="search"
            placeholder="검색"
            data-profile-connections-search
          />
        </label>
        <section
          class="account-connections-list"
          data-profile-connections-list
          aria-label="Member list"
        ></section>
      </section>
    </section>
  `;
}

function renderProfileConnectionItems(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = profileConnectionMembers.filter((member) => {
    const searchableText = `${member.username} ${member.name}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });

  if (!filteredMembers.length) {
    return `<p class="account-connections-empty">검색 결과가 없습니다.</p>`;
  }

  return filteredMembers
    .map(
      (member) => `
        <a class="account-connection-item" href="${member.href}">
          <img
            class="account-connection-avatar"
            src="${member.avatarSrc}"
            alt="${member.username} 프로필 이미지"
          />
          <span class="account-connection-copy">
            <strong>${member.username}</strong>
            <small>${member.name}</small>
          </span>
        </a>
      `,
    )
    .join("");
}

function setProfileConnectionsList(query = "") {
  const list = document.querySelector("[data-profile-connections-list]");

  if (!list) {
    return;
  }

  list.innerHTML = renderProfileConnectionItems(query);
}

function openProfileConnectionsModal(type) {
  const modal = document.querySelector("[data-profile-connections-modal]");
  const title = document.querySelector("#accountConnectionsTitle");
  const searchInput = document.querySelector(
    "[data-profile-connections-search]",
  );
  const closeButton = document.querySelector(
    "[data-profile-connections-close]",
  );

  if (!modal || !title) {
    return;
  }

  title.textContent = getProfileConnectionTitle(type);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("account-connections-modal-open");

  if (searchInput) {
    searchInput.value = "";
  }

  setProfileConnectionsList();
  closeButton?.focus();
}

function closeProfileConnectionsModal() {
  const modal = document.querySelector("[data-profile-connections-modal]");

  if (!modal) {
    return;
  }

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("account-connections-modal-open");
}

function bindProfileConnectionsModal() {
  const searchInput = document.querySelector(
    "[data-profile-connections-search]",
  );

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-profile-connections-open]");

    if (trigger) {
      openProfileConnectionsModal(trigger.dataset.profileConnectionsOpen);
      return;
    }

    if (event.target.closest("[data-profile-connections-close]")) {
      closeProfileConnectionsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    const trigger = event.target.closest("[data-profile-connections-open]");

    if (trigger && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openProfileConnectionsModal(trigger.dataset.profileConnectionsOpen);
      return;
    }

    if (event.key === "Escape") {
      closeProfileConnectionsModal();
    }
  });

  searchInput?.addEventListener("input", (event) => {
    setProfileConnectionsList(event.target.value);
  });
}

function mountProfile() {
  const roots = {
    header: document.querySelector("#accountProfileHeaderRoot"),
    hero: document.querySelector("#accountProfileHeroRoot"),
    actions: document.querySelector("#accountProfileActionsRoot"),
    highlights: document.querySelector("#accountProfileHighlightsRoot"),
    tabs: document.querySelector("#accountProfileTabsRoot"),
    posts: document.querySelector("#accountProfilePostsRoot"),
    bottomNav: document.querySelector("#accountProfileBottomNavRoot"),
    connectionsModal: document.querySelector(
      "#accountProfileConnectionsModalRoot",
    ),
  };

  roots.header.innerHTML = renderProfileHeader(accountProfile);
  roots.hero.innerHTML = renderProfileHero(accountProfile);
  roots.actions.innerHTML = renderProfileActions();
  roots.highlights.innerHTML = renderProfileHighlights(accountProfile);
  roots.tabs.innerHTML = renderProfileTabs();
  roots.posts.innerHTML = renderProfilePostGrid();
  roots.bottomNav.innerHTML = renderProfileBottomNav(accountProfile);
  roots.connectionsModal.innerHTML = renderProfileConnectionsModal();
  bindProfileConnectionsModal();
}

mountProfile();
