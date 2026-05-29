const accountProfile = {
  username: "TACO-1029",
  handle: "TACO-1029",
  avatarSrc: "../static/img/introstagram_avatar.png",
  stats: [
    { label: "게시물", value: "0" },
    { label: "팔로워", value: "4" },
    { label: "팔로우", value: "4" },
  ],
  bioLines: [""],
  link: "",
  highlights: [{ label: "🧙", src: "../static/img/introstagram_avatar.png" }],
};

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
        <div>
          <strong>${stat.value}</strong>
          <span>${stat.label}</span>
        </div>
      `,
    )
    .join("");
  const desktopStatsMarkup = profile.stats
    .map(
      (stat) => `
        <div>
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
      <a href="#"><span class="bookmark-mini"></span><span>저장됨</span></a>
      <a href="#"><span class="tagged-icon"></span><span>태그됨</span></a>
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

function mountProfile() {
  const roots = {
    header: document.querySelector("#accountProfileHeaderRoot"),
    hero: document.querySelector("#accountProfileHeroRoot"),
    actions: document.querySelector("#accountProfileActionsRoot"),
    highlights: document.querySelector("#accountProfileHighlightsRoot"),
    tabs: document.querySelector("#accountProfileTabsRoot"),
    posts: document.querySelector("#accountProfilePostsRoot"),
    bottomNav: document.querySelector("#accountProfileBottomNavRoot"),
  };

  roots.header.innerHTML = renderProfileHeader(accountProfile);
  roots.hero.innerHTML = renderProfileHero(accountProfile);
  roots.actions.innerHTML = renderProfileActions();
  roots.highlights.innerHTML = renderProfileHighlights(accountProfile);
  roots.tabs.innerHTML = renderProfileTabs();
  roots.posts.innerHTML = renderProfilePostGrid();
  roots.bottomNav.innerHTML = renderProfileBottomNav(accountProfile);
}

mountProfile();
