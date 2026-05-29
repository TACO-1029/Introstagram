const directChatData = {
  user: {
    name: "현대퓨처넷",
    handle: "hyundai_futurenet",
  },
  attachmentLabel: "Attachment",
  preview: {
    account: "@hyundai_futurenet",
    text: "현대퓨처넷에게 공유!",
  },
  time: "오전 8:14",
  story: {
    profile: "🐶",
    name: "현대퓨처넷",
    caption: "냐냐냐",
    title: "하굣잎 ★<br />울어서<br />눈방벙",
  },
};

const directChatRoot = document.querySelector("#directChatRoot");
const directThreadOpenButton = document.querySelector("[data-direct-thread-open]");
const directApp = document.querySelector(".direct-app");

function createDirectChatHeader(user) {
  const header = document.createElement("header");
  header.className = "direct-chat-header";
  header.innerHTML = `
    <span class="direct-avatar photo-a"></span>
    <span class="direct-chat-user">
      <strong>${user.name}</strong>
      <small>${user.handle}</small>
    </span>
    <span class="direct-chat-actions"> </span>
  `;

  return header;
}

function createDirectAttachmentBar(label) {
  const attachment = document.createElement("section");
  attachment.className = "direct-attachment-bar";
  attachment.innerHTML = `
    <span>📌</span>
    <span class="direct-attachment-thumb"></span>
    <strong>${label}</strong>
  `;

  return attachment;
}

function createDirectChatBody(data) {
  const body = document.createElement("section");
  body.className = "direct-chat-body";
  body.innerHTML = `
    <p class="direct-link-preview">
      <strong>${data.preview.account}</strong> ${data.preview.text}
    </p>
    <time>${data.time}</time>
    <article class="direct-story-card">
      <span class="direct-story-profile">${data.story.profile}</span>
      <strong>${data.story.name}</strong>
      <span>${data.story.caption}</span>
      <b>${data.story.title}</b>
      <small>▶</small>
    </article>
  `;

  return body;
}

function createDirectMessageForm() {
  const form = document.createElement("form");
  form.className = "direct-message-form";
  form.innerHTML = `
    <button type="button" aria-label="Emoji">☺</button>
    <input type="text" placeholder="메시지 입력..." />
    <button
      type="button"
      class="comment-submit-btn"
      aria-label="댓글 게시"
      data-comment-submit
    >
      <span class="comment-submit-icon"></span>
    </button>
  `;

  return form;
}

function createDirectEmptyState() {
  const emptyState = document.createElement("section");
  emptyState.className = "direct-empty-chat";
  emptyState.innerHTML = `
    <img
      class="direct-empty-chat-icon"
      src="../static/icons/direct-empty-message-icon.svg"
      alt=""
    />
    <h2>내 메시지</h2>
    <p>친구나 그룹에 비공개 사진과 메시지를 보내보세요</p>
    <button type="button">메시지 보내기</button>
  `;

  return emptyState;
}

function createDirectChatContent(data) {
  const fragment = document.createDocumentFragment();
  fragment.append(
    createDirectChatHeader(data.user),
    createDirectAttachmentBar(data.attachmentLabel),
    createDirectChatBody(data),
    createDirectMessageForm(),
  );

  return fragment;
}

function renderDirectEmptyState() {
  if (!directChatRoot) {
    return;
  }

  directChatRoot.replaceChildren(createDirectEmptyState());
  directChatRoot.classList.remove("direct-chat-active");
  directApp?.classList.remove("direct-chat-open");
}

function renderDirectChat() {
  if (!directChatRoot) {
    return;
  }

  directChatRoot.replaceChildren(createDirectChatContent(directChatData));
  directChatRoot.classList.add("direct-chat-active");
  directApp?.classList.add("direct-chat-open");
}

directThreadOpenButton?.addEventListener("click", (event) => {
  event.preventDefault();
  directThreadOpenButton.classList.add("selected");
  renderDirectChat();
});

renderDirectEmptyState();
