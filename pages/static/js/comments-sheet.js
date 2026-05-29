const COMMENT_STORAGE_KEY = "introstagram_comments";

const commentsSheet = document.querySelector("[data-comments-sheet]");
const commentsOpenButtons = document.querySelectorAll("[data-comments-open]");
const commentsCloseButton = document.querySelector("[data-comments-close]");

const commentsList = document.querySelector(".comments-list");
const commentInput = document.querySelector("[data-comment-input]");
const commentSubmitButton = document.querySelector("[data-comment-submit]");
const reactionButtons = document.querySelectorAll(".comments-reactions button");

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

function createCommentElement(comment) {
  const commentRow = document.createElement("article");
  commentRow.className = "comment-row";

  const isHashText = comment.content.startsWith("#");

  commentRow.innerHTML = `
    <span class="comment-avatar gray-avatar"></span>
    <div class="comment-copy">
      <p><strong>me</strong> <small>방금</small></p>
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

commentsOpenButtons.forEach((button) => {
  button.addEventListener("click", openComments);
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

renderStoredComments();
