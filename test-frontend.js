const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const stylesheet = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');

async function loadPage(file, url, apiResponses = {}) {
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    url,
    virtualConsole
  });
  const { window } = dom;

  window.fetch = async requestedUrl => {
    const pathname = new URL(requestedUrl, window.location.href).pathname;
    const payload = Object.hasOwn(apiResponses, pathname) ? apiResponses[pathname] : [];
    if (payload instanceof Error) throw payload;
    return {
      ok: true,
      status: 200,
      json: async () => structuredClone(payload)
    };
  };
  window.alert = () => {};
  window.confirm = () => true;
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  });
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.HTMLElement.prototype.scrollIntoView = () => {};

  window.eval(script);
  await new Promise(resolve => setTimeout(resolve, 25));
  return dom;
}

test('mobile navigation exposes state and closes with Escape', async () => {
  const dom = await loadPage('index.html', 'http://localhost:5510/');
  const { document, KeyboardEvent } = dom.window;
  const toggle = document.getElementById('menuToggle');
  const navigation = document.getElementById('primaryNavigation');

  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(navigation.classList.contains('open'), true);
  assert.match(toggle.textContent, /Close navigation menu/);

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(navigation.classList.contains('open'), false);
  assert.match(toggle.textContent, /Open navigation menu/);
  dom.window.close();
});

test('responsive visuals keep content photography uncropped and headings restrained', () => {
  const coverRules = stylesheet.match(/object-fit:\s*cover/g) || [];

  assert.equal(coverRules.length, 1);
  assert.match(stylesheet, /\.brand-logo\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(stylesheet, /\.portrait-photo\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(stylesheet, /\.post-image\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(stylesheet, /\.blog-article-image\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(stylesheet, /body\s*\{[^}]*font-size:\s*14\.5px/s);
  assert.match(
    stylesheet,
    /\.hero h1\s*\{[^}]*font-size:\s*clamp\(\s*calc\(2\.3rem - 2px\),\s*calc\(4vw - 2px\),\s*calc\(3\.8rem - 2px\)\s*\)/s
  );
  assert.match(stylesheet, /@media \(max-width:\s*1080px\)[\s\S]*\.menu-toggle\s*\{[\s\S]*display:\s*flex/);
});

test('admin editor provides authenticated featured-image upload controls', () => {
  assert.match(adminHtml, /id="postImageFile"/);
  assert.match(adminHtml, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(adminHtml, /id="postImage"\s+name="postImage"/);
  assert.match(adminHtml, /id="postImagePreviewImage"/);
  assert.match(adminHtml, /id="removePostImage"/);
  assert.match(script, /apiRequest\('\/uploads'/);
  assert.match(script, /canvas\.toBlob\(resolve,\s*'image\/webp',\s*0\.82\)/);
});

test('blog renders the four curated fallback posts with semantic headings', async () => {
  const dom = await loadPage('blog.html', 'http://localhost:5510/blog.html', {
    '/api/posts': new Error('Server unavailable')
  });
  const cards = dom.window.document.querySelectorAll('#postsContainer .post-card');

  assert.equal(cards.length, 4);
  assert.equal(cards[0].querySelector('h3').textContent, 'The Becoming That Comes From Being Broken');
  assert.equal(cards[0].querySelector('img').getAttribute('loading'), 'lazy');
  assert.match(cards[0].querySelector('a').getAttribute('href'), /^post\.html\?id=/);
  dom.window.close();
});

test('blog post rendering strips unsafe rich-content markup', async () => {
  const unsafePost = {
    id: 'unsafe',
    title: 'Safe title',
    category: 'Faith',
    date: 'July 27, 2026',
    dateValue: '2026-07-27',
    excerpt: 'A safe excerpt.',
    body: 'Safe body',
    bodyHtml: '<p onclick="alert(1)">Hello <img src=x onerror=alert(1)><a href="javascript:alert(1)">link</a><script>alert(1)</script></p>'
  };
  const dom = await loadPage('post.html', 'http://localhost:5510/post.html?id=unsafe', {
    '/api/posts': [unsafePost]
  });
  const { document } = dom.window;
  const body = document.querySelector('.blog-article-body');

  assert.equal(document.querySelector('h1').textContent, 'Safe title');
  assert.equal(body.querySelector('script'), null);
  assert.equal(body.querySelector('img'), null);
  assert.equal(body.querySelector('[onclick]'), null);
  assert.equal(body.querySelector('a').hasAttribute('href'), false);
  assert.equal(body.querySelector('a').getAttribute('rel'), 'noopener noreferrer');
  assert.equal(document.querySelector('time').getAttribute('datetime'), '2026-07-27');
  dom.window.close();
});
