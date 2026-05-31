const homePostFiles = [
  "./pages/member/1/posts/post-1.html",
  "./pages/member/1/posts/post-2.html",
  "./pages/member/1/posts/post-3.html",
  "./pages/member/1/posts/post-4.html",
  "./pages/member/1/posts/post-5.html",
  "./pages/member/1/posts/post-6.html",
  "./pages/member/3/posts/post-1.html",
  "./pages/member/3/posts/post-2.html",
  "./pages/member/3/posts/post-3.html",
  "./pages/member/3/posts/post-4.html",
  "./pages/member/3/posts/post-5.html",
  "./pages/member/3/posts/post-6.html",
];

const homeFeedRoot = document.querySelector("#homeFeedRoot");

function shufflePosts(posts) {
  return [...posts].sort(() => Math.random() - 0.5);
}

function resolveAssetPath(value, baseUrl) {
  if (!value || typeof value !== "string") {
    return value;
  }

  if (/^(https?:|data:|blob:)/.test(value)) {
    return value;
  }

  return new URL(value, baseUrl).href;
}

function normalizePostPaths(postData, postFilePath) {
  const postUrl = new URL(postFilePath, window.location.href);
  const normalized =
    typeof structuredClone === "function"
      ? structuredClone(postData)
      : JSON.parse(JSON.stringify(postData));

  if (normalized.user?.avatar) {
    normalized.user.avatar = resolveAssetPath(normalized.user.avatar, postUrl);
  }

  normalized.likeKey = postFilePath.replace(/^\.\//, "");
  normalized.slides = normalized.slides.map((slide) => ({
    ...slide,
    image: resolveAssetPath(slide.image, postUrl),
    fallback: resolveAssetPath(slide.fallback, postUrl),
  }));

  return normalized;
}

function extractPostData(html) {
  const match = html.match(
    /window\.introstagramPostData\s*=\s*([\s\S]*?);\s*<\/script>/,
  );

  if (!match) {
    return null;
  }

  const postWindow = {};
  Function("window", `window.introstagramPostData = ${match[1]};`)(postWindow);
  return postWindow.introstagramPostData || null;
}

async function loadPostData(postFilePath) {
  const response = await fetch(postFilePath);

  if (!response.ok) {
    throw new Error(`Failed to load ${postFilePath}`);
  }

  const html = await response.text();
  const postData = extractPostData(html);

  if (!postData) {
    return null;
  }

  return normalizePostPaths(postData, postFilePath);
}

async function renderHomeFeed() {
  if (!homeFeedRoot || !window.introstagramPostComponents) {
    return;
  }

  try {
    const results = await Promise.allSettled(homePostFiles.map(loadPostData));
    const posts = results
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => result.value);

    if (!posts.length) {
      throw new Error("No posts loaded");
    }

    const shuffledPosts = shufflePosts(posts);
    const cards = shuffledPosts.map((postData) =>
      window.introstagramPostComponents.createPostCard(postData, {
        className: "app-layout-post post-card home-feed-card",
      }),
    );

    homeFeedRoot.replaceChildren(...cards);
    window.introstagramUpdateCommentsCount?.();
  } catch (error) {
    homeFeedRoot.innerHTML =
      '<p class="home-feed-message">피드를 불러오려면 로컬 서버로 index.html을 열어주세요.</p>';
    console.error(error);
  }
}

renderHomeFeed();
