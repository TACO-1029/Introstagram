const COMMENT_STORAGE_KEY = "introstagram_comments";

const commentsSheet = document.querySelector("[data-comments-sheet]");
const commentsCloseButton = document.querySelector("[data-comments-close]");

const commentsList = document.querySelector(".comments-list");
const commentInput = document.querySelector("[data-comment-input]");
const commentSubmitButton = document.querySelector("[data-comment-submit]");
const reactionButtons = document.querySelectorAll(".comments-reactions button");
const commentAvatarSrc = "./pages/static/img/introstagram_avatar.png";

function getStoredComments() {
  const storedComments = localStorage.getItem(COMMENT_STORAGE_KEY);

  if (!storedComments) {
    return [];
  }

  return JSON.parse(storedComments);
}

function saveComments(comments) {
  localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments));
}

function updateCommentsCountLabel() {
  const count = commentsList.querySelectorAll(".comment-row").length;
  const countText = `댓글 ${count}개 모두 보기`;
  const commentsCountLabels = document.querySelectorAll(
    "[data-comments-count-label]",
  );

  commentsCountLabels.forEach((label) => {
    label.textContent = countText;
  });
}

function formatCommentDateTime(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function createCommentElement(comment) {
  const commentRow = document.createElement("article");
  commentRow.className = "comment-row";

  const isHashText = comment.content.startsWith("#");
  const commentDateTime = formatCommentDateTime(comment.createdAt);

  commentRow.innerHTML = `
    <img class="comment-avatar" src="${commentAvatarSrc}" alt="" />
    <div class="comment-copy">
      <p><strong>me</strong> <small>${commentDateTime}</small></p>
      <span class="${isHashText ? "comment-hashtag" : ""}">${comment.content}</span>
      <button type="button">답글 달기</button>
    </div>
    <span class="comment-like">
      <span class="comment-like-icon"></span>
    </span>
  `;

  return commentRow;
}

function renderStoredComments() {
  const comments = getStoredComments();

  comments.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentsList.appendChild(commentElement);
  });

  updateCommentsCountLabel();
}

function addComment(commentContent) {
  const content = commentContent || commentInput.value.trim();

  if (!content) {
    return;
  }

  const newComment = {
    id: Date.now(),
    content,
    createdAt: new Date().toISOString(),
  };

  const comments = getStoredComments();
  comments.push(newComment);
  saveComments(comments);

  const commentElement = createCommentElement(newComment);
  commentsList.appendChild(commentElement);
  updateCommentsCountLabel();

  commentInput.value = "";
}

function openComments() {
  commentsSheet.classList.add("open");
  commentsSheet.setAttribute("aria-hidden", "false");
}

function closeComments() {
  commentsSheet.classList.remove("open");
  commentsSheet.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-comments-open]")) {
    openComments();
  }
});
commentsCloseButton.addEventListener("click", closeComments);

commentsSheet.addEventListener("click", (event) => {
  if (event.target === commentsSheet) {
    closeComments();
  }
});

commentSubmitButton.addEventListener("click", () => {
  addComment();
});

commentInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addComment();
  }
});

reactionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addComment(button.textContent);
  });
});

window.introstagramUpdateCommentsCount = updateCommentsCountLabel;

renderStoredComments();
