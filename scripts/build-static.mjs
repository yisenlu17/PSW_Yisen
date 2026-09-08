#!/usr/bin/env node
/**
 * Builds the site as plain files, for GitHub Pages.
 *
 * Vercel is unreachable from mainland China, which is half of who a bilingual CV is
 * written for. This produces a second copy of the same site that any file host can
 * serve — `out/`, which `.github/workflows/deploy.yml` publishes to Pages.
 *
 * Four things have to happen around `next build` rather than inside it:
 *
 *   1. The parts that need a server have to leave the tree. `output: 'export'` fails
 *      on a route handler that reads a request, on a proxy at all, and on a Server
 *      Action anywhere in the graph — and there is no per-file way to say "not in
 *      this build", so they are moved out and put back.
 *   2. `.nojekyll`, or Pages hands every `_next/*` URL a 404: the default pipeline is
 *      Jekyll, and Jekyll does not publish paths beginning with an underscore.
 *   3. An `index.html` at the root. The bare address used to be answered by the proxy
 *      choosing a language; a file host has no proxy, so the choice ships as a file.
 *   4. A `.png` on the end of the share cards, which are routes on Vercel and have to
 *      be filenames here.
 *
 * Run it with `npm run build:static`.
 */
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stash = join(root, '.static-build-stash')

/**
 * What leaves the tree for the duration of the build, as [live path, stash name].
 *
 * `api/` is draft mode, the language cookie and the revalidation webhook — three
 * things that only mean anything while a server is answering requests. `proxy.ts` is
 * the language redirect for the bare address, which becomes the generated
 * `index.html` below.
 *
 * `(studio)` is the editing tool. It could be exported — it is a client-side app
 * behind a Sanity login — but it would add megabytes of bundle to a site whose whole
 * point is loading over a slow link, and put an editor's front door on a public host
 * to no end. It stays where it is useful: `npm run dev` and `/studio`, or
 * `sanity deploy` for a hosted one.
 */
const NOT_IN_STATIC_BUILD = [
  [join(root, 'src', 'app', 'api'), 'api'],
  [join(root, 'src', 'app', '(studio)'), 'studio-group'],
  [join(root, 'src', 'proxy.ts'), 'proxy.ts'],
]

/**
 * What is replaced rather than removed, as [live path, stand-in, stash name].
 *
 * Both are here for one reason: an export build is rejected for *containing* a Server
 * Action anywhere in the graph, whether or not anything renders it, so guarding the
 * call site does nothing and the modules themselves have to go. `VisualEditing` holds
 * one; `defineLive` holds another, and that one reached every page in the site —
 * `fetch.ts` imports `live.ts` for the draft branch, and every page imports
 * `fetch.ts`.
 *
 * Each stand-in keeps the import resolving with the same types and does nothing,
 * which is what draft tooling amounts to on a host with no editor in front of it.
 *
 * A swap rather than `turbopack.resolveAlias`, which does not see through the `@/*`
 * paths this project imports by.
 */
const SWAPPED_FOR_STATIC_BUILD = [
  [
    join(root, 'src', 'sanity', 'draft-tools.tsx'),
    join(root, 'src', 'sanity', 'draft-tools.static.tsx'),
    'draft-tools.tsx',
  ],
  [join(root, 'src', 'sanity', 'live.ts'), join(root, 'src', 'sanity', 'live.static.ts'), 'live.ts'],
]

const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'zh']

/** `/PSW_Yisen` on a project site, empty on a custom domain. Never a trailing slash. */
const basePath = (process.env.STATIC_BASE_PATH ?? '/PSW_Yisen').replace(/\/+$/, '')

function stow() {
  mkdirSync(stash, { recursive: true })
  for (const [live, name] of NOT_IN_STATIC_BUILD) {
    if (existsSync(live)) renameSync(live, join(stash, name))
  }
  for (const [live, standIn, name] of SWAPPED_FOR_STATIC_BUILD) {
    if (!existsSync(live)) continue
    renameSync(live, join(stash, name))
    copyFileSync(standIn, live)
  }
}

/**
 * Puts the tree back — from a `finally`, so a failed build leaves it as it was found,
 * and again at startup, so a build that was killed outright does not leave the next
 * one exporting a repository with half its source missing, or a stand-in sitting
 * where the real file belongs.
 *
 * The stash is the record of what was touched: anything in it is an original, and
 * whatever occupies its place is disposable.
 */
function restore() {
  if (!existsSync(stash)) return
  for (const [live, name] of NOT_IN_STATIC_BUILD) {
    const stowed = join(stash, name)
    if (existsSync(stowed) && !existsSync(live)) renameSync(stowed, live)
  }
  for (const [live, , name] of SWAPPED_FOR_STATIC_BUILD) {
    const stowed = join(stash, name)
    if (!existsSync(stowed)) continue
    rmSync(live, { force: true })
    renameSync(stowed, live)
  }
  if (readdirSync(stash).length === 0) rmSync(stash, { recursive: true, force: true })
}

/** Every file under a directory, depth first. */
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

/**
 * The page the bare address gets: whichever language you last chose, else whichever
 * your browser asks for, else English.
 *
 * The same rule `proxy.ts` applies, moved to the client because that is the only
 * place left that can apply it. It is a `replace` rather than an assignment so the
 * back button returns to wherever the reader came from rather than to this file,
 * which would bounce them straight forward again. The `<a>` is what someone with
 * scripting off gets, and the `<meta>` catches the case in between.
 */
function landingPage() {
  const home = `${basePath}/${DEFAULT_LOCALE}/`
  return `<!doctype html>
<html lang="${DEFAULT_LOCALE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yisen Lu</title>
<link rel="canonical" href="${home}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${home}">
<script>
(function () {
  var locales = ${JSON.stringify(LOCALES)};
  var base = ${JSON.stringify(basePath)};
  var pick = ${JSON.stringify(DEFAULT_LOCALE)};
  try {
    var remembered = '';
    var jar = String(document.cookie || '').split(';');
    for (var c = 0; c < jar.length; c++) {
      var pair = jar[c].split('=');
      if (pair[0].trim() === 'lang') { remembered = decodeURIComponent((pair[1] || '').trim()); }
    }
    if (locales.indexOf(remembered) !== -1) {
      pick = remembered;
    } else {
      var asked = navigator.languages || [navigator.language || ''];
      for (var i = 0; i < asked.length; i++) {
        var primary = String(asked[i]).toLowerCase().split('-')[0];
        if (locales.indexOf(primary) !== -1) { pick = primary; break; }
      }
    }
  } catch (e) {}
  location.replace(base + '/' + pick + '/');
})();
</script>
</head>
<body>
<p><a href="${home}">Yisen Lu</a></p>
</body>
</html>
`
}

/**
 * Puts the base path in front of the asset URLs inside the stylesheets.
 *
 * `basePath` is applied by the router and by the bundler's own asset handling, and a
 * URL written inside a CSS file passes through neither. `fonts.css` asks for
 * `/fonts/inter-400-fa4229.woff2`, which is correct at the root and, under
 * `/PSW_Yisen`, is seven 404s and a page rendered in whatever the system font is —
 * quietly, since a missing font is not an error anywhere.
 *
 * Skipped entirely on a custom domain, where the site is at the root and the URLs in
 * the file are already right.
 */
function prefixCssAssetUrls(dir) {
  if (!basePath) return 0
  let touched = 0

  for (const path of walk(dir)) {
    if (!/\.css$/.test(path)) continue
    const before = readFileSync(path, 'utf8')

    // Only a single leading slash: `//cdn.example.com/…` is another origin and
    // `data:` and relative URLs are already resolved against this one.
    const after = before.replace(/url\((\s*['"]?)(\/(?!\/)[^'")]*)/g, (match, open, url) =>
      url.startsWith(`${basePath}/`) ? match : `url(${open}${basePath}${url}`
    )

    if (after !== before) {
      writeFileSync(path, after)
      touched++
    }
  }

  return touched
}

/**
 * Gives the share cards a `.png` on the end, and repoints everything naming them.
 *
 * `opengraph-image.tsx` is a route, and a route has no file extension — Next writes
 * it out as `opengraph-image-1yhjss`, a PNG that does not look like one. Vercel
 * serves it with the `contentType` the route exports; a file host has only the name
 * to go on, and Pages hands anything it cannot place to the browser as
 * `application/octet-stream`. WhatsApp, LinkedIn and WeChat all read the type before
 * the bytes, so every share of this site would have come up blank.
 *
 * The rename is half the fix and the rewrite is the other half: `og:image` in the
 * HTML, and the same URL again in the RSC payload beside it, both have to follow.
 */
function nameShareCardsAsPng(dir) {
  const card = /^opengraph-image-[A-Za-z0-9_-]+$/
  const renamed = new Set()
  let files = 0

  for (const path of walk(dir)) {
    const name = basename(path)
    if (!card.test(name)) continue
    renameSync(path, `${path}.png`)
    renamed.add(name)
    files++
  }

  if (renamed.size === 0) return 0

  // One card serves many pages, so the same name recurs; one pass per distinct name
  // over the text output is enough. The lookahead is what makes it safe to run over
  // output a previous pass already touched.
  const patterns = [...renamed].map((name) => new RegExp(`${name}(?!\\.png)`, 'g'))

  for (const path of walk(dir)) {
    if (!/\.(html|txt)$/.test(path)) continue
    const before = readFileSync(path, 'utf8')
    let after = before
    for (const pattern of patterns) after = after.replace(pattern, (match) => `${match}.png`)
    if (after !== before) writeFileSync(path, after)
  }

  return files
}

restore()
stow()
try {
  // Next's own entry point rather than `npx next`, which on Windows needs a shell —
  // and a shell concatenates arguments instead of passing them, which Node warns
  // about for good reason. This is one path and no quoting.
  const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
  execFileSync(process.execPath, [nextBin, 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, STATIC_EXPORT: '1', STATIC_BASE_PATH: basePath },
  })
} finally {
  restore()
}

const out = join(root, 'out')
if (!existsSync(out)) {
  console.error('build-static: next build produced no out/ — nothing to publish.')
  process.exit(1)
}

// Underscore-prefixed paths are Jekyll's own, and Pages runs Jekyll unless told not
// to. Without this the HTML is served and every script and stylesheet under `_next/`
// 404s, which looks like a broken stylesheet rather than a missing file.
writeFileSync(join(out, '.nojekyll'), '')
writeFileSync(join(out, 'index.html'), landingPage())

const cards = nameShareCardsAsPng(out)
const sheets = prefixCssAssetUrls(out)

console.log(
  `\nbuild-static: out/ ready for Pages at ${basePath || '/'}` +
    ` — ${cards} share cards named, ${sheets} stylesheets repointed`
)
