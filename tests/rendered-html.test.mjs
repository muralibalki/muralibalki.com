import assert from "node:assert/strict";
import test from "node:test";

const descriptionMeta =
  /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']Research on AI, machine learning, optimization, and production data systems\.["'])[^>]*>/i;

test("renders production metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(
    html,
    /<title>Balakrishnan \(Murali\) Narayanaswamy<\/title>/i,
  );
  assert.match(html, descriptionMeta);
});

test("renders the blog index and first Markdown post", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("blog-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
  const context = {
    waitUntil() {},
    passThroughOnException() {},
  };

  const indexResponse = await worker.fetch(
    new Request("http://localhost/blog", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(indexResponse.status, 200);
  assert.match(await indexResponse.text(), /href=["']\/blog\/finding-the-gap["']/i);

  const postResponse = await worker.fetch(
    new Request("http://localhost/blog/finding-the-gap", {
      headers: { accept: "text/html" },
    }),
    env,
    context,
  );
  assert.equal(postResponse.status, 200);
  const html = await postResponse.text();
  assert.match(html, /<h1>Finding the Gap<\/h1>/i);
  assert.match(html, /href=["']\/research["']/i);
  assert.match(html, /href=["']https:\/\/www\.cs\.princeton\.edu\/~arvindn\/["']/i);
});
