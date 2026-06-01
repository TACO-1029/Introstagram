const DIRECT_MESSAGE_STORAGE_KEY = "introstagram_direct_messages";

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
    profile: "../../static/img/introstagram_avatar.webp",
    name: "introstagram team",
    caption: "",
    title: "",
  },
};

const directChatRoot = document.querySelector("#directChatRoot");
const directThreadOpenButton = document.querySelector(
  "[data-direct-thread-open]",
);
const directApp = document.querySelector(".direct-app");

function getStoredDirectMessages() {
  try {
    return JSON.parse(
      sessionStorage.getItem(DIRECT_MESSAGE_STORAGE_KEY) || "[]",
    );
  } catch (error) {
    return [];
  }
}

function saveStoredDirectMessages(messages) {
  sessionStorage.setItem(DIRECT_MESSAGE_STORAGE_KEY, JSON.stringify(messages));
}

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

function createDirectMessageElement(message) {
  const messageBubble = document.createElement("p");
  messageBubble.className = "direct-message-bubble";
  messageBubble.textContent = message.content;
  messageBubble.dataset.messageId = message.id;

  return messageBubble;
}

function renderStoredDirectMessages() {
  const body = directChatRoot?.querySelector(".direct-chat-body");

  if (!body) {
    return;
  }

  const oldMessageList = body.querySelector(".direct-message-list");
  oldMessageList?.remove();

  const messages = getStoredDirectMessages();

  if (!messages.length) {
    return;
  }

  const messageList = document.createElement("section");
  messageList.className = "direct-message-list";
  messageList.setAttribute("aria-label", "보낸 메시지 목록");
  messageList.append(...messages.map(createDirectMessageElement));

  body.append(messageList);
}

function addDirectMessage() {
  const input = directChatRoot?.querySelector(".direct-message-form input");
  const content = input?.value.trim();

  if (!content) {
    return;
  }

  const newMessage = {
    id: String(Date.now()),
    sender: "me",
    content,
    createdAt: new Date().toISOString(),
  };

  const messages = getStoredDirectMessages();
  messages.push(newMessage);
  saveStoredDirectMessages(messages);

  input.value = "";
  renderStoredDirectMessages();
}

function createDirectChatBody(data) {
  const body = document.createElement("section");
  body.className = "direct-chat-body";
  body.innerHTML = `
    <p class="direct-link-preview">
      <strong>${data.preview.account}</strong> ${data.preview.text}
    </p>
    <time>${data.time}</time>
    <a class="direct-story-card" href="../reels/index.html" aria-label="릴스 보기">
      <img
        class="direct-story-image"
        src="../../static/img/reels/reels-1-thumbnail.webp"
        alt=""
      />
      <span class="direct-story-profile">
        <img src="${data.story.profile}" alt="" />
      </span>
      <strong>${data.story.name}</strong>
      <b>${data.story.title}</b>
      <small>▶</small>
    </a>
  `;

  return body;
}

function createDirectMessageForm() {
  const form = document.createElement("form");
  form.className = "direct-message-form";
  form.innerHTML = `
    <button
      type="button"
      class="direct-message-emoji-btn"
      aria-label="이모지 선택"
    >
      ☺
    </button>

    <input type="text" placeholder="메시지 입력..." />

    <button
      type="button"
      class="direct-message-submit-btn"
      aria-label="메시지 전송"
      data-direct-message-submit
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
      src="../../static/icons/direct-empty-message-icon.svg"
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
  renderStoredDirectMessages();
}

directThreadOpenButton?.addEventListener("click", (event) => {
  event.preventDefault();
  directThreadOpenButton.classList.add("selected");
  renderDirectChat();
});

directChatRoot?.addEventListener("click", (event) => {
  const submitButton = event.target.closest("[data-direct-message-submit]");

  if (!submitButton) {
    return;
  }

  addDirectMessage();
});

directChatRoot?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  const input = event.target.closest(".direct-message-form input");

  if (!input) {
    return;
  }

  event.preventDefault();
  addDirectMessage();
});

renderDirectEmptyState();
