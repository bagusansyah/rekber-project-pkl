// Notifies IndexNow (Bing, Yandex, and other participating search engines)
// whenever a blog post is published, so it gets crawled within minutes
// instead of waiting for the next organic crawl.
// Docs: https://www.indexnow.org/documentation

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function getAppHost() {
  const appUrl = process.env.APP_URL || "https://www.rekber.com";
  return new URL(appUrl).host;
}

async function submitUrlToIndexNow(path) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return; // Not configured (e.g. local dev) — skip silently.

  const host = getAppHost();
  const url = new URL(path, `https://${host}`).toString();

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: [url],
      }),
    });

    if (response.ok) {
      console.log(`IndexNow submit OK (${response.status}) for ${url}`);
    } else {
      console.error(`IndexNow submit failed (${response.status}) for ${url}`);
    }
  } catch (error) {
    console.error("IndexNow submit error:", error.message);
  }
}

module.exports = { submitUrlToIndexNow };
