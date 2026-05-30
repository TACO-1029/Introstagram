const COMMENT_STORAGE_KEY = "introstagram_comments_by_post";

const commentsSheet = document.querySelector("[data-comments-sheet]");
const commentsCloseButton = document.querySelector("[data-comments-close]");
const commentsPreviewImage = document.querySelector(
  ".comments-media-preview img",
);
const commentsList = document.querySelector(".comments-list");
const commentInput = document.querySelector("[data-comment-input]");
const commentSubmitButton = document.querySelector("[data-comment-submit]");
const reactionButtons = document.querySelectorAll(".comments-reactions button");
const commentAvatarSrc = "./pages/static/img/introstagram_avatar.png";
const fallbackPostKey = "introstagram-default-post";

let activePostKey = fallbackPostKey;
let activeCommentContext = null;

function getStoredCommentsByPost() {
  try {
    return JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function saveCommentsByPost(commentsByPost) {
  localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsByPost));
}

function getStoredComments(postKey = activePostKey) {
  return getStoredCommentsByPost()[postKey] || [];
}

function saveComments(postKey, comments) {
  const commentsByPost = getStoredCommentsByPost();
  commentsByPost[postKey] = comments;
  saveCommentsByPost(commentsByPost);
}

function getCommentContext(postKey) {
  return window.introstagramCommentContexts?.[postKey] || null;
}

function getCommentsCount(postKey) {
  return getStoredComments(postKey).length;
}

function updateCommentsCountLabel(postKey = null) {
  const labels = document.querySelectorAll(
    "[data-comments-count-label], [data-comments-label]",
  );

  labels.forEach((label) => {
    const labelPostKey = label.dataset.commentsKey || activePostKey;

    if (postKey && labelPostKey !== postKey) {
      return;
    }

    const count = getCommentsCount(labelPostKey);
    label.textContent = `댓글 ${count}개 모두 보기`;
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

function createAvatarElement(comment) {
  if (comment.avatarSrc) {
    const avatar = document.createElement("img");
    avatar.className = "comment-avatar";
    avatar.src = comment.avatarSrc;
    avatar.alt = "";
    return avatar;
  }

  const avatar = document.createElement("span");
  avatar.className = `comment-avatar ${comment.avatarClass || "gray-avatar"}`;
  return avatar;
}

function createCommentElement(comment) {
  const commentRow = document.createElement("article");
  const copy = document.createElement("div");
  const meta = document.createElement("p");
  const username = document.createElement("strong");
  const time = document.createElement("small");
  const content = document.createElement("span");
  const replyButton = document.createElement("button");
  const like = document.createElement("span");
  const likeIcon = document.createElement("span");

  commentRow.className = "comment-row";
  copy.className = "comment-copy";
  username.textContent = comment.username || "me";
  time.textContent = comment.time || formatCommentDateTime(comment.createdAt);
  content.textContent = comment.content;
  content.className = comment.content?.startsWith("#")
    ? "comment-hashtag"
    : "";
  replyButton.type = "button";
  replyButton.textContent = "답글 달기";
  like.className = "comment-like";
  likeIcon.className = "comment-like-icon";

  meta.append(username, document.createTextNode(" "), time);
  copy.append(meta, content, replyButton);
  like.append(likeIcon);

  if (comment.likes) {
    const likes = document.createElement("small");
    likes.textContent = comment.likes;
    like.append(likes);
  }

  commentRow.append(createAvatarElement(comment), copy, like);
  return commentRow;
}

function renderComments(postKey = activePostKey) {
  const comments = getStoredComments(postKey);
  commentsList.replaceChildren(...comments.map(createCommentElement));
  updateCommentsCountLabel(postKey);
}

function addComment(commentContent) {
  const content = commentContent || commentInput.value.trim();

  if (!content) {
    return;
  }

  const newComment = {
    id: Date.now(),
    username: "me",
    content,
    avatarSrc: commentAvatarSrc,
    createdAt: new Date().toISOString(),
  };

  const comments = getStoredComments(activePostKey);
  comments.push(newComment);
  saveComments(activePostKey, comments);
  renderComments(activePostKey);
  commentInput.value = "";
}

function getTriggerCommentContext(trigger) {
  const postCard = trigger.closest(".post-card");
  const postKey =
    trigger.dataset.commentsKey || postCard?.dataset.postKey || fallbackPostKey;
  const registeredContext = getCommentContext(postKey);
  const previewImage =
    trigger.dataset.commentsPreviewImage ||
    postCard?.dataset.postPreviewImage ||
    postCard?.querySelector(".post-slide-image")?.src ||
    commentsPreviewImage?.src ||
    "";

  return {
    postKey,
    previewImage,
    userName: registeredContext?.userName || "introstagram_team",
    userAvatar: registeredContext?.userAvatar || "",
  };
}

function openComments(trigger) {
  activeCommentContext = getTriggerCommentContext(trigger);
  activePostKey = activeCommentContext.postKey;

  if (commentsPreviewImage && activeCommentContext.previewImage) {
    commentsPreviewImage.src = activeCommentContext.previewImage;
  }

  renderComments(activePostKey);
  commentsSheet.classList.add("open");
  commentsSheet.setAttribute("aria-hidden", "false");
}

function closeComments() {
  commentsSheet.classList.remove("open");
  commentsSheet.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const commentsOpenButton = event.target.closest("[data-comments-open]");

  if (commentsOpenButton) {
    openComments(commentsOpenButton);
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
    addComment(button.textContent.trim());
  });
});

window.introstagramUpdateCommentsCount = updateCommentsCountLabel;

updateCommentsCountLabel();
