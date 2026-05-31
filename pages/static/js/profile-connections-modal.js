const profileConnectionMembers = [
  {
    username: "dogeonwoo",
    name: "도건우",
    avatarSrc: "../../static/img/member-1/profile/dogeonwoo-profile.webp",
    href: "../1/index.html",
  },
  {
    username: "member_two",
    name: "Member 2",
    avatarSrc: "../../static/img/introstagram_avatar.webp",
    href: "../2/index.html",
  },
  {
    username: "jaewonwi",
    name: "위재원",
    avatarSrc: "../../static/img/member-3/profile/jaewon-profile.webp",
    href: "../3/index.html",
  },
  {
    username: "choiwoojin",
    name: "최우진",
    avatarSrc: "../../static/img/member-4/profile/woojin_profile.webp",
    href: "../4/index.html",
  },
  {
    username: "introstagram team",
    name: "introstagram team",
    avatarSrc: "../../static/img/introstagram_avatar.webp",
    href: "../../profile/index.html",
  },
];

function getProfileConnectionTitle(type) {
  return type === "following" ? "팔로잉" : "팔로워";
}

function renderProfileConnectionItems(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const currentMember = document.body.dataset.currentMember || "";

  const filteredMembers = profileConnectionMembers.filter((member) => {
    const isCurrentMember = member.username === currentMember;

    if (isCurrentMember) {
      return false;
    }

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

bindProfileConnectionsModal();
