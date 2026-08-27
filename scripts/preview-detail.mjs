/**
 * Renders the three case studies as a standalone page, without touching Sanity.
 *
 * The words in `project-content.mjs` cannot be seen until they are in the dataset,
 * and putting them there needs an Editor token. This closes that gap: it reproduces
 * the markup `ProjectDetail` and `PortableBody` emit, wraps it in the site's own
 * stylesheets, and writes one HTML file you can open — so the layout can be argued
 * with before anything is written.
 *
 *   node scripts/preview-detail.mjs [out.html]
 *
 * It is a preview, not a second renderer: if the components change, this drifts. The
 * page it produces says so.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve, extname } from 'node:path'

import { PROJECTS, writeUp, mediaFiles } from './project-content.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// A published Artifact is wrapped in its own document skeleton, so that mode emits
// the page contents alone — same markup, same stylesheets, no <html> of its own.
const ARTIFACT = process.argv.includes('--artifact')
const out = resolve(
  process.argv.slice(2).find((a) => !a.startsWith('--')) ?? join(root, '.preview', 'project-detail.html')
)

/**
 * The fields that live in the dataset rather than in the content module — the script
 * that writes the case studies deliberately leaves these alone, so the preview has to
 * be told what they already are.
 */
const DATASET = {
  'project.dongqiuwang': { title: '我是懂球王', slug: 'woshidongqiuwang', startDate: '2026-01-01' },
  'project.just-hoop': { title: 'Just Hoop', slug: 'just-hoop', startDate: '2026-03-01' },
  'project.zhipai': { title: '智排', slug: 'zhipai', startDate: '2025-01-01' },
}

/** Mirrors isInProgress in src/lib/project.ts — what "no link yet" is allowed to mean. */
const IN_PROGRESS = ['building', 'validating', 'prototype']
const NO_DOOR = {
  en: 'In development — nothing public to open yet',
  zh: '开发中 · 暂无公开入口',
}

/** Mirrors STATUS in src/lib/project.ts. */
const STATUS = {
  live: { en: 'Live', zh: '已上线' },
  inUse: { en: 'In daily use', zh: '每天在用' },
  comingSoon: { en: 'Launching soon', zh: '即将上线' },
  building: { en: 'In development', zh: '开发中' },
  validating: { en: 'In validation', zh: '验证阶段' },
  prototype: { en: 'Prototype', zh: '原型' },
  archived: { en: 'Archived', zh: '已归档' },
}

/** Mirrors DETAIL_COPY in src/components/detail/DetailChrome.tsx. */
const COPY = {
  en: {
    back: 'All projects',
    features: 'What it does',
    learnings: 'What I learned',
    builtWith: 'Built with',
    related: 'Related projects',
  },
  zh: {
    back: '全部项目',
    features: '它能做什么',
    learnings: '我学到了什么',
    builtWith: '技术栈',
    related: '相关项目',
  },
}

/* --------------------------------------------------------------------- media */

/**
 * The screenshots, read off the disk rather than out of the dataset.
 *
 * This is the point of previewing at all: a picture can be looked at under the
 * paragraph it was chosen for before anything is uploaded, and a file that is not
 * there yet simply does not appear — the same thing the write script does.
 */
const MEDIA = join(root, 'media', 'project')
const onDisk = Object.fromEntries(
  [...new Set(mediaFiles().map((m) => m.file))]
    .filter((file) => existsSync(join(MEDIA, file)))
    .map((file) => [file, 'on disk'])
)

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' }

/**
 * A published artifact cannot reach the disk, so that mode carries the bytes; a file
 * opened locally points at them instead, which keeps the page small enough to reload
 * without thinking about it.
 */
function imgSrc(file) {
  const path = join(MEDIA, file)
  if (!ARTIFACT) return pathToFileURL(path).href
  const type = MIME[extname(file).toLowerCase()] ?? 'image/png'
  return `data:${type};base64,${readFileSync(path).toString('base64')}`
}

/**
 * Portrait or wide, from the file itself — the same call the page makes from the
 * asset id, so a phone screenshot is held to a phone's width here too.
 */
function shape(file) {
  const png = readFileSync(join(MEDIA, file))
  if (png.slice(1, 4).toString() !== 'PNG') return 'wide'
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  return height > width * 1.25 ? 'portrait' : 'wide'
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const years = (start, lang) => `${start.slice(0, 4)} — ${lang === 'zh' ? '至今' : 'now'}`

/* ------------------------------------------------- Portable Text → the markup */

const inline = (children) =>
  children
    .map((span) =>
      span.marks?.includes('strong') ? `<strong>${esc(span.text)}</strong>` : esc(span.text)
    )
    .join('')

function flow(node) {
  const tag = node.variant === 'set' ? 'ul' : 'ol'
  const steps = node.steps.map((s) => `<li class="flow-step"><span>${esc(s)}</span></li>`).join('')
  return (
    `<div class="flow" data-variant="${node.variant}">` +
    (node.label ? `<p class="flow-label">${esc(node.label)}</p>` : '') +
    `<${tag} class="flow-steps">${steps}</${tag}></div>`
  )
}

/** Consecutive list items become one `<ul>`, exactly as @portabletext/react groups them. */
function richText(blocks, lang) {
  const html = []
  let list = null

  const closeList = () => {
    if (list) {
      html.push(`<ul>${list.join('')}</ul>`)
      list = null
    }
  }

  for (const b of blocks) {
    if (b._type === 'flowSteps') {
      closeList()
      html.push(flow(b))
      continue
    }
    if (b._type === 'image') {
      closeList()
      const caption = b.caption?.[lang]
      html.push(
        `<figure class="body-figure" data-shape="${shape(b._file)}">` +
          `<img src="${imgSrc(b._file)}" alt="${esc(b.alt ?? '')}">` +
          (caption ? `<figcaption>${esc(caption)}</figcaption>` : '') +
          '</figure>'
      )
      continue
    }
    if (b.listItem) {
      list ??= []
      list.push(`<li>${inline(b.children)}</li>`)
      continue
    }
    closeList()
    const tag = b.style === 'h3' ? 'h3' : b.style === 'blockquote' ? 'blockquote' : 'p'
    html.push(`<${tag}>${inline(b.children)}</${tag}>`)
  }
  closeList()
  return `<div class="rich-text">${html.join('')}</div>`
}

/* ------------------------------------------------------------------- the page */

const list = (label, items, lang) =>
  items?.length
    ? `<div class="detail-block"><h2>${esc(label)}</h2><ul class="detail-list">` +
      items.map((i) => `<li>${esc(i[lang])}</li>`).join('') +
      '</ul></div>'
    : ''

function detail(project, lang) {
  const c = COPY[lang]
  const meta = DATASET[project._id]
  const status = STATUS[project.status]?.[lang] ?? ''

  const chips = [
    `<span class="detail-chip" data-shipped="false">${esc(status)}</span>`,
    `<span class="detail-chip">${esc(years(meta.startDate, lang))}</span>`,
    ...project.roleDetail.map((r) => `<span class="detail-chip detail-chip-role">${esc(r[lang])}</span>`),
  ].join('')

  const buttons = (project.links ?? []).map(
    (l) => `<a class="btn btn-ghost" href="${esc(l.url)}">${esc(l.label[lang])}</a>`
  )
  if (buttons.length === 0 && IN_PROGRESS.includes(project.status)) {
    buttons.push(`<span class="detail-handle">${esc(NO_DOOR[lang])}</span>`)
  }
  const links = buttons.length ? `<div class="detail-links">${buttons.join('')}</div>` : ''

  const stack = project.stack?.length
    ? `<div class="detail-block"><h2>${esc(c.builtWith)}</h2><div class="detail-tags">` +
      project.stack.map((s) => `<span class="detail-tag">${esc(s)}</span>`).join('') +
      '</div></div>'
    : ''

  const related = project.related
    .map((id) => {
      const other = PROJECTS.find((p) => p._id === id)
      return (
        '<div class="detail-related-card">' +
        `<span class="detail-chip" data-shipped="false">${esc(STATUS[other.status]?.[lang] ?? '')}</span>` +
        `<h3>${esc(DATASET[id].title)}</h3><p>${esc(other.summary[lang])}</p></div>`
      )
    })
    .join('')

  // The cover is cropped by Sanity on the real page; here it is the whole screenshot,
  // which is the more useful thing to look at while choosing one.
  const cover =
    project.cover && onDisk[project.cover.file]
      ? '<div class="detail-cover"><div class="wrap">' +
        `<img src="${imgSrc(project.cover.file)}" alt="${esc(project.cover.alt ?? '')}">` +
        '</div></div>'
      : ''

  return (
    `<main class="detail" data-project="${project._id}" data-lang="${lang}" hidden>` +
    '<header class="detail-head"><div class="wrap">' +
    `<span class="detail-back"><span aria-hidden="true">←</span> ${esc(c.back)}</span>` +
    `<p class="eyebrow">${esc(project.category[lang])}</p>` +
    `<h1>${esc(meta.title)}</h1>` +
    `<p class="detail-meta">${esc(project.tagline[lang])}</p>` +
    `<p class="detail-lede">${esc(project.summary[lang])}</p>` +
    `<div class="detail-chips">${chips}</div>${links}` +
    '</div></header>' +
    cover +
    '<div class="wrap detail-body">' +
    richText(writeUp(project.nodes, lang, onDisk), lang) +
    list(c.features, project.features, lang) +
    list(c.learnings, project.learnings, lang) +
    stack +
    '</div>' +
    `<section class="detail-related"><div class="wrap"><h2>${esc(c.related)}</h2>` +
    `<div class="detail-related-grid">${related}</div></div></section>` +
    '</main>'
  )
}

/* --------------------------------------------------------------------- output */

const css = ['tokens.css', 'ui-kit.css', 'site.css']
  .map((file) => readFileSync(join(root, 'src', 'styles', file), 'utf8'))
  .join('\n')

const tabs = PROJECTS.map(
  (p, i) =>
    `<button class="pv-tab" data-target="${p._id}"${i === 0 ? ' aria-current="true"' : ''}>` +
    `${esc(DATASET[p._id].title)}<span>/projects/${DATASET[p._id].slug}</span></button>`
).join('')

const pages = PROJECTS.map((p) => ['en', 'zh'].map((lang) => detail(p, lang)).join('')).join('')

const head = ARTIFACT
  ? `<title>Three Projects, One Layout</title>`
  : `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Three Projects, One Layout</title>`

const html = `${head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${css}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--sans); color: var(--body); background: var(--paper); }
a { text-decoration: none; color: inherit; }
h1, h2, h3 { font-family: var(--display); color: var(--ink); }

/* Preview chrome — not part of the site. */
.pv-bar {
  position: sticky; top: 0; z-index: 10;
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  padding: 10px clamp(16px, 4vw, 28px);
  background: #05172f; border-bottom: 1px solid rgba(255,255,255,.12);
}
.pv-mark {
  font-family: var(--mono); font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--gold); margin-right: 8px;
}
.pv-tab {
  appearance: none; border: 1px solid rgba(255,255,255,.18); background: transparent;
  color: rgba(255,255,255,.72); border-radius: 999px; padding: 7px 15px;
  font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: baseline; gap: 9px;
}
.pv-tab span { font-family: var(--mono); font-size: 10.5px; opacity: .55; }
.pv-tab[aria-current='true'] { background: var(--gold); border-color: var(--gold); color: #05172f; }
.pv-langs { margin-left: auto; display: flex; gap: 6px; }
.pv-lang {
  appearance: none; border: 1px solid rgba(255,255,255,.18); background: transparent;
  color: rgba(255,255,255,.72); border-radius: 999px; padding: 7px 14px;
  font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer;
}
.pv-lang[aria-current='true'] { background: rgba(255,255,255,.14); color: #fff; }
.pv-note {
  padding: 14px clamp(16px, 4vw, 28px); background: var(--gold-soft);
  font-size: 13px; color: var(--ink); border-bottom: 1px solid rgba(200,162,75,.35);
}
main[hidden] { display: none; }
</style>
${ARTIFACT ? '' : '</head><body>'}
<div class="pv-bar"><span class="pv-mark">Preview</span>${tabs}
<div class="pv-langs"><button class="pv-lang" data-lang="en" aria-current="true">EN</button><button class="pv-lang" data-lang="zh">中文</button></div>
</div>
<p class="pv-note">Static preview of <code>/projects/&lt;slug&gt;</code> rendered from <code>scripts/project-content.mjs</code> with the site's own stylesheets, and the screenshots from <code>media/project/</code>. The site header and footer are omitted — everything else is the markup the components emit.</p>
${pages}
<script>
const state = { project: ${JSON.stringify(PROJECTS[0]._id)}, lang: 'en' }
function apply() {
  for (const el of document.querySelectorAll('main.detail')) {
    el.hidden = el.dataset.project !== state.project || el.dataset.lang !== state.lang
  }
  for (const el of document.querySelectorAll('.pv-tab')) {
    el.setAttribute('aria-current', String(el.dataset.target === state.project))
  }
  for (const el of document.querySelectorAll('.pv-lang')) {
    el.setAttribute('aria-current', String(el.dataset.lang === state.lang))
  }
}
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.pv-tab')
  if (tab) { state.project = tab.dataset.target; apply(); window.scrollTo(0, 0); return }
  const lang = e.target.closest('.pv-lang')
  if (lang) { state.lang = lang.dataset.lang; apply() }
})
apply()
</script>
${ARTIFACT ? '' : '</body></html>'}
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, html, 'utf8')
console.log(`✓ ${out}`)
console.log(`  ${PROJECTS.length} projects × 2 languages, ${(html.length / 1024).toFixed(0)} KB`)
