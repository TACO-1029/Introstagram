(function () {
  function getDefaultAvatarSrc() {
    return (
      document.body.dataset.commentAvatarSrc ||
      "./static/img/introstagram_avatar.webp"
    );
  }

  function getDefaultPreviewSrc() {
    return (
      document.body.dataset.commentPreviewSrc ||
      "./static/img/post-slide-1.svg"
    );
  }

  function ensureIntrostagramCommentsSheet(options = {}) {
    const existingSheet = document.querySelector("[data-comments-sheet]");

    if (existingSheet) {
      return existingSheet;
    }

    const avatarSrc = options.avatarSrc || getDefaultAvatarSrc();
    const previewSrc = options.previewSrc || getDefaultPreviewSrc();
    const sheet = document.createElement("section");
    sheet.className = "comments-sheet";
    sheet.dataset.commentsSheet = "";
    sheet.setAttribute("aria-hidden", "true");
    sheet.innerHTML = `
      <div class="comments-panel" role="dialog" aria-label="댓글">
        <section class="comments-media-preview" aria-label="게시물 이미지 미리보기">
          <img src="${previewSrc}" alt="" />
        </section>

        <span class="comments-handle" aria-hidden="true"></span>

        <header class="comments-header">
          <h2>댓글</h2>
          <button type="button" data-comments-close aria-label="Close comments">
            ×
          </button>
        </header>

        <section class="comments-list" aria-label="Comment list"></section>

        <footer class="comments-composer">
          <div class="comments-reactions" aria-label="Quick reactions">
            <button type="button">❤️</button>
            <button type="button">🙌</button>
            <button type="button">🔥</button>
            <button type="button">👏</button>
            <button type="button">🥲</button>
            <button type="button">😍</button>
            <button type="button">😮</button>
            <button type="button">😂</button>
          </div>

          <div class="comments-input-row">
            <img src="${avatarSrc}" alt="" />
            <input type="text" placeholder="댓글 추가..." data-comment-input />

            <button
              type="button"
              class="comment-submit-btn"
              aria-label="댓글 게시"
              data-comment-submit
            >
              <span class="comment-submit-icon"></span>
            </button>
          </div>
        </footer>
      </div>
    `;

    document.body.append(sheet);
    return sheet;
  }

  window.ensureIntrostagramCommentsSheet = ensureIntrostagramCommentsSheet;
})();
