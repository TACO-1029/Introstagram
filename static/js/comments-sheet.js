const COMMENT_STORAGE_KEY = "introstagram_comments_by_post";
const commentAvatarSrc =
  document.body.dataset.commentAvatarSrc ||
  "./static/img/introstagram_avatar.webp";
const fallbackPostKey = "introstagram-default-post";
const commentsSheet =
  window.ensureIntrostagramCommentsSheet?.({ avatarSrc: commentAvatarSrc }) ||
  document.querySelector("[data-comments-sheet]");

let activePostKey = fallbackPostKey;
let activeCommentContext = null;
let isSubmittingComment = false;

if (!commentsSheet) {
  window.introstagramUpdateCommentsCount = () => {};
} else {
  const commentsCloseButton = commentsSheet.querySelector(
    "[data-comments-close]",
  );
  const commentsPreviewImage = commentsSheet.querySelector(
    ".comments-media-preview img",
  );
  const commentsList = commentsSheet.querySelector(".comments-list");
  const commentInput = commentsSheet.querySelector("[data-comment-input]");
  const commentSubmitButton = commentsSheet.querySelector(
    "[data-comment-submit]",
  );
  const reactionButtons = commentsSheet.querySelectorAll(
    ".comments-reactions button",
  );

  function getStoredCommentsByPost() {
    try {
      return JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveCommentsByPost(commentsByPost) {
    try {
      localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsByPost));
    } catch (error) {
      console.warn("댓글을 저장하지 못했습니다.", error);
    }
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
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(safeDate);
  }

  function resolveCommentAvatarSrc(src) {
    if (!src) {
      return "";
    }

    const isAbsoluteSrc = /^(https?:|data:|blob:|\/)/.test(src);

    if (isAbsoluteSrc) {
      return src;
    }

    if (src.includes("static/img/introstagram_avatar.webp")) {
      return commentAvatarSrc;
    }

    return src;
  }

  function createAvatarElement(comment) {
    const avatarSrc = resolveCommentAvatarSrc(comment.avatarSrc);

    if (avatarSrc) {
      const avatar = document.createElement("img");
      avatar.className = "comment-avatar";
      avatar.src = avatarSrc;
      avatar.alt = "";
      return avatar;
    }

    const avatar = document.createElement("span");
    avatar.className = `comment-avatar ${comment.avatarClass || "gray-avatar"}`;
    return avatar;
  }

  function getCommentElementId(comment, index) {
    return String(
      comment.id ??
        `${comment.username || "comment"}-${comment.createdAt || comment.time || index}-${comment.content || ""}`,
    );
  }

  function createCommentElement(comment, index) {
    const commentRow = document.createElement("article");
    const copy = document.createElement("div");
    const meta = document.createElement("p");
    const username = document.createElement("strong");
    const time = document.createElement("small");
    const content = document.createElement("span");
    const replyButton = document.createElement("button");
    const like = document.createElement("span");
    const likeIcon = document.createElement("span");
    const commentId = getCommentElementId(comment, index);

    commentRow.className = "comment-row";
    copy.className = "comment-copy";
    username.textContent = comment.username || "introstagram team";
    time.textContent = comment.time || formatCommentDateTime(comment.createdAt);
    content.textContent = comment.content;
    content.className = comment.content?.startsWith("#")
      ? "comment-hashtag"
      : "";
    replyButton.type = "button";
    replyButton.textContent = "답글 달기";
    like.className = "comment-like";
    likeIcon.className = `comment-like-icon${comment.liked ? " active" : ""}`;
    likeIcon.setAttribute("role", "button");
    likeIcon.setAttribute("tabindex", "0");
    likeIcon.setAttribute("data-comment-like", "");
    likeIcon.dataset.commentId = commentId;
    likeIcon.setAttribute("aria-label", "댓글 좋아요");
    likeIcon.setAttribute("aria-pressed", comment.liked ? "true" : "false");

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

  function toggleCommentLike(commentId) {
    const comments = getStoredComments(activePostKey);
    const nextComments = comments.map((comment, index) => {
      if (getCommentElementId(comment, index) !== commentId) {
        return comment;
      }

      return {
        ...comment,
        id: comment.id ?? commentId,
        liked: !comment.liked,
      };
    });

    saveComments(activePostKey, nextComments);
    renderComments(activePostKey);
  }

  function submitComment(commentContent = null) {
    if (isSubmittingComment) {
      return;
    }

    const content = String(commentContent ?? commentInput.value).trim();

    if (!content) {
      return;
    }

    isSubmittingComment = true;
    commentSubmitButton.disabled = true;

    const newComment = {
      id: Date.now(),
      username: "introstagram team",
      content,
      avatarSrc: commentAvatarSrc,
      createdAt: new Date().toISOString(),
      liked: false,
    };

    const comments = getStoredComments(activePostKey);
    comments.push(newComment);
    saveComments(activePostKey, comments);
    renderComments(activePostKey);
    commentInput.value = "";

    setTimeout(() => {
      isSubmittingComment = false;
      commentSubmitButton.disabled = false;
    }, 250);
  }

  function getTriggerCommentContext(trigger) {
    const postCard = trigger.closest(".post-card");
    const postKey =
      trigger.dataset.commentsKey ||
      postCard?.dataset.postKey ||
      fallbackPostKey;
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
      event.preventDefault();
      openComments(commentsOpenButton);
    }
  });

  commentsCloseButton.addEventListener("click", closeComments);

  commentsSheet.addEventListener("click", (event) => {
    if (event.target === commentsSheet) {
      closeComments();
    }
  });

  commentsList.addEventListener("click", (event) => {
    const likeButton = event.target.closest("[data-comment-like]");

    if (!likeButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggleCommentLike(likeButton.dataset.commentId);
  });

  commentsList.addEventListener("keydown", (event) => {
    const likeButton = event.target.closest("[data-comment-like]");

    if (!likeButton || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggleCommentLike(likeButton.dataset.commentId);
  });

  commentSubmitButton.addEventListener("click", () => {
    submitComment();
  });

  commentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitComment();
    }
  });

  reactionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      submitComment(button.textContent.trim());
    });
  });

  window.introstagramUpdateCommentsCount = updateCommentsCountLabel;

  updateCommentsCountLabel();
}
