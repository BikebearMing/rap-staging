// Self-check for the editor-HTML image rewrite in src/lib/wp.js (images in
// post bodies and Project Stories go through the image optimiser). Run from
// the repo root with plain node, no build or server needed:
//
//   node scripts/check-wp-images.mjs
//
// Outside the Next.js build, getImageProps uses Next's default widths rather
// than next.config.mjs's, so this checks the shape of the result, not exact
// widths. Production mode skips next/image's dev-only remotePatterns check,
// which has no config to check against here. The bundler resolves the bare
// "next/image"; plain node needs the file name.
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

registerHooks({
  resolve: (spec, context, next) => next(spec === "next/image" ? "next/image.js" : spec, context),
});
process.env.NODE_ENV = "production";
const { normalizePost, normalizeWork } = await import("../src/lib/wp.js");
const post = (html) => normalizePost({ content: html }).content;

const U = "https://cms.rap.com.my/wp-content/uploads/2026/09";
const optimised = (url) => `/_next/image?url=${encodeURIComponent(url)}&amp;w=`;

// WordPress's own markup: the widest srcset entry (the original) is the source
let out = post(
  `<figure class="wp-block-image size-large"><img loading="lazy" decoding="async" width="1024" height="545" src="${U}/a-1024x545.png" alt="A &amp; B" class="wp-image-283" srcset="${U}/a-1024x545.png 1024w, ${U}/a-300x160.png 300w, ${U}/a.png 1058w" sizes="auto, (max-width: 1024px) 100vw, 1024px" /></figure>`
);
assert.match(out, /^<figure class="wp-block-image size-large"><img /);
assert.ok(out.endsWith(" /></figure>"));
assert.ok(out.includes(`src="${optimised(`${U}/a.png`)}`), out);
assert.ok(!out.includes("cms.rap.com.my/wp-content/uploads/2026/09/a-1024x545.png"), out);
assert.ok(!out.includes("a-300x160"), out);
assert.match(out, /srcset="(\/_next\/image\?url=[^"\s]+ \d+w, )+\/_next\/image\?url=[^"\s]+ \d+w"/);
assert.ok(out.includes(' sizes="(max-width: 768px) 88vw, 74vw"'), out);
for (const kept of [' width="1024"', ' height="545"', ' alt="A &amp; B"', ' class="wp-image-283"'])
  assert.ok(out.includes(kept), kept);
assert.equal(out.match(/ loading="lazy"/g).length, 1);
assert.equal(out.match(/ decoding="async"/g).length, 1);
assert.ok(!out.includes("auto,"));

// Single quotes, other attribute order, no srcset, not self-closing, in a
// link, extra classes, http:// upgraded first
out = post(
  `<a href="/x"><img class='one two' src='http://cms.rap.com.my/wp-content/uploads/b.jpg' alt='b'></a>`
);
assert.ok(out.startsWith(`<a href="/x"><img class='one two' alt='b' src="/_next/image?url=`), out);
assert.ok(out.includes(encodeURIComponent("https://cms.rap.com.my/wp-content/uploads/b.jpg")));
assert.ok(out.endsWith(` loading="lazy" decoding="async"></a>`), out);

// Story HTML gets the story column's sizes
out = normalizeWork({ workFields: { projectStory: `<img src="${U}/c.jpg" alt="">` } }).story;
assert.ok(out.includes(' sizes="(max-width: 768px) 88vw, 66vw"'), out);

// Left exactly as written: other hosts, CMS files outside uploads, and tags
// that don't read cleanly
for (const html of [
  `<img src="https://example.com/wp-content/uploads/x.jpg" alt="x">`,
  `<img src="https://cms.rap.com.my/wp-includes/images/smilies/x.png" alt="">`,
  `<img src="${U}/x.jpg" src="${U}/y.jpg">`, // duplicate attribute
  `<img src="${U}/x.jpg" srcset="${U}/x.jpg 1x, ${U}/y.jpg 2x">`, // density srcset
  `<img src="${U}/x.jpg" srcset="https://example.com/y.jpg 900w">`, // foreign candidate
  `<img src="${U}/x.jpg?a=1&amp;b=2">`, // entity in the URL
  `<img src="${U}/x.jpg" alt="unterminated>`,
  `<img src="${U}/x.jpg" alt=bad"quote>`,
  `<p>no images here</p>`,
]) {
  assert.equal(post(html), html, html);
}

// Several images: each rewritten independently, the text between untouched
out = post(
  `<p>a</p><img src="${U}/1.jpg"><p>b > c</p><img src="https://example.com/2.jpg"><p>d</p>`
);
assert.equal(out.match(/<img /g).length, 2);
assert.ok(out.startsWith(`<p>a</p><img src="/_next/image?url=`), out);
assert.ok(out.endsWith(`<p>b > c</p><img src="https://example.com/2.jpg"><p>d</p>`), out);

console.log("check-wp-images: all passed");
