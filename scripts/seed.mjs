/**
 * Seeds the dataset from the prototype's own copy, split across real pages.
 *
 * Run once against an empty dataset:
 *   SANITY_API_WRITE_TOKEN=... npm run seed
 *
 * Uses `createIfNotExists` with fixed IDs, so re-running will not overwrite edits
 * made in the studio. To reshape the seed, delete the documents first:
 *   npm run seed -- --replace
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const REPLACE = process.argv.includes('--replace')

for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || projectId === 'placeholder') {
  console.error('✗ Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local first.')
  process.exit(1)
}
if (!token) {
  console.error('✗ SANITY_API_WRITE_TOKEN is required (a Developer or Editor token).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-08-07', useCdn: false })

const C = JSON.parse(readFileSync(join(root, 'design-reference/content.en-zh.json'), 'utf8'))
const L = (key) => ({ _type: 'localeString', en: C[key]?.en ?? '', zh: C[key]?.zh ?? '' })
const LT = (key) => ({ _type: 'localeText', en: C[key]?.en ?? '', zh: C[key]?.zh ?? '' })
const lit = (en, zh) => ({ _type: 'localeString', en, zh })
const litT = (en, zh) => ({ _type: 'localeText', en, zh })
const settings = (label, extra = {}) => ({ _type: 'sectionSettings', label, ...extra })

/**
 * The prototype left the English hero paragraph holding the Chinese text, so
 * English visitors read Chinese. Translated here rather than shipping the bug —
 * review the wording, it is a translation, not your words.
 */
const HERO_LEDE_EN =
  "I'm Yisen Lu — a Japanese major who moved into product. Six enterprise website projects running in parallel at Orfeostory, community football operations at Stranger Soccer, 20+ financial process documents written solo at Ernst & Young. In my own time I built an NBA prediction platform, and a scheduling system for my mother's business."

/* ------------------------------------------------------------------ experience */

const EXPERIENCES = [
  {
    _id: 'experience.orfeostory',
    company: 'Orfeostory',
    slug: 'orfeostory',
    category: lit('Digital product · Singapore', '数字产品 · 新加坡'),
    location: 'Singapore',
    startDate: '2026-07-01',
    endDate: null,
    featured: true,
    keys: { role: 'ex1r', summary: 'ex1b', secondary: 'ex1c', highlight: 'ex1s' },
    skills: ['Product management', 'Client communication', 'Sitemaps', 'Competitor research'],
  },
  {
    _id: 'experience.stranger-soccer',
    company: 'Stranger Soccer',
    slug: 'stranger-soccer',
    category: lit('Operations & growth · Singapore', '运营与增长 · 新加坡'),
    location: 'Singapore',
    startDate: '2025-08-01',
    endDate: '2025-11-01',
    featured: true,
    keys: { role: 'ex2r', summary: 'ex2b', secondary: 'ex2c', highlight: 'ex2s' },
    skills: ['Community operations', 'Pricing', 'Retention analysis', 'Short-form video'],
  },
  {
    _id: 'experience.ernst-young',
    company: 'Ernst & Young',
    slug: 'ernst-young',
    category: lit('Financial services · Shanghai', '金融服务 · 上海'),
    location: 'Shanghai',
    startDate: '2024-07-01',
    endDate: '2024-09-01',
    featured: true,
    keys: { role: 'ex3r', summary: 'ex3b', secondary: 'ex3c', highlight: 'ex3s' },
    skills: ['Process documentation', 'Visio', 'Sector analysis'],
  },
  {
    _id: 'experience.suoao',
    company: 'Shanghai Suoao Information Technology',
    slug: 'shanghai-suoao',
    category: lit('Project operations · Shanghai', '项目运营 · 上海'),
    location: 'Shanghai',
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    featured: false,
    keys: { role: 'ex4r', summary: 'ex4b' },
    highlight: lit('2 DAYS → 2 HOURS', '两天 → 两小时'),
    skills: ['SOP authoring', 'Quality review'],
  },
  {
    _id: 'experience.zhifeng',
    company: 'Zhifeng Sports Culture',
    slug: 'zhifeng-sports',
    category: lit('Sports marketing · Changzhou', '体育营销 · 常州'),
    location: 'Changzhou',
    startDate: '2023-07-01',
    endDate: '2023-09-01',
    featured: false,
    keys: { role: 'ex5r', summary: 'ex5b' },
    highlight: lit('10,000+ READS', '10,000+ 阅读'),
    skills: ['WeChat & Weibo', 'Video editing', 'Sponsor liaison'],
  },
]

const experienceDocs = EXPERIENCES.map((e, i) => ({
  _id: e._id,
  _type: 'experience',
  company: e.company,
  slug: { _type: 'slug', current: e.slug },
  role: L(e.keys.role),
  category: e.category,
  location: e.location,
  startDate: e.startDate,
  ...(e.endDate ? { endDate: e.endDate } : {}),
  featured: e.featured,
  order: i + 1,
  summary: LT(e.keys.summary),
  ...(e.keys.secondary ? { secondary: LT(e.keys.secondary) } : {}),
  highlight: e.highlight ?? (e.keys.highlight ? L(e.keys.highlight) : undefined),
  skills: e.skills,
}))

/* -------------------------------------------------------------------- sections */

const heroSection = {
  _key: 'hero',
  _type: 'heroSection',
  eyebrow: L('heroBrow'),
  headlineLine1: L('h1a'),
  headlineLine2: L('h1b'),
  rotatingWords: [lit('built', '做出来'), lit('shipped', '交付'), lit('used', '被用起来')],
  lede: { _type: 'localeText', en: HERO_LEDE_EN, zh: C.heroLede?.zh ?? '' },
  ctas: [
    { _key: 'cta1', label: L('ctaWork'), href: '/experience', style: 'gold' },
    { _key: 'cta2', label: L('ctaStory'), href: '/about', style: 'ghost' },
  ],
  metaItems: [
    lit('1.29°N 103.85°E', '1.29°N 103.85°E'),
    lit('中文 · ENGLISH · 日本語', '中文 · ENGLISH · 日本語'),
    lit("MSC VENTURE CREATION '27", '风险创造硕士 · 2027 届'),
  ],
  showPortrait: false,
  portraitBadge: L('portraitBadge'),
  rotateHeadlineWord: true,
  settings: settings('Hero', { anchorId: 'top', theme: 'dark' }),
}

const statsSection = {
  _key: 'numbers',
  _type: 'statsSection',
  eyebrow: L('nuBrow'),
  title: L('nuTitle'),
  note: LT('nuNote'),
  feature: {
    source: lit('Shanghai Suoao', '上海梭翱'),
    value: lit('2 *days* → 2 *hours*', '两 *天* → 两 *小时*'),
    description: LT('nu0'),
  },
  stats: [
    { v: '20,000', s: '+', c: 20000, k: 'nu1', src: lit('Shanghai Suoao, 2024', '上海梭翱,2024') },
    { v: '5,000', s: '+', c: 5000, k: 'nu2', src: lit('Shanghai Suoao, 2024', '上海梭翱,2024') },
    { v: '6', s: '', c: 6, k: 'nu3', src: lit('Orfeostory, 2026', 'Orfeostory,2026') },
    { v: '20', s: '+', c: 20, k: 'nu4', src: lit('Ernst & Young, 2024', '安永,2024') },
    { v: '10,000', s: '+', c: 10000, k: 'nu5', src: lit('Zhifeng Sports, 2023', '致峰体育,2023') },
    { v: '6,000', s: '+', c: 6000, k: 'nu6', src: lit('Zhifeng Sports, 2023', '致峰体育,2023') },
    { v: '3', s: '', c: null, k: 'nu7', src: lit('中文 · English · 日本語', '中文 · English · 日本語') },
  ].map((s, i) => ({
    _key: `stat${i + 1}`,
    value: s.v,
    ...(s.s ? { suffix: s.s } : {}),
    ...(s.c ? { countTo: s.c } : {}),
    label: L(s.k),
    source: s.src,
  })),
  settings: settings('Numbers', { anchorId: 'numbers', theme: 'cream' }),
}

const introSection = {
  _key: 'story',
  _type: 'editorialIntroSection',
  eyebrow: L('thBrow'),
  title: L('thTitle'),
  lede: LT('thLede'),
  note: LT('thNote'),
  steps: [1, 2, 3, 4].map((n) => ({ _key: `step${n}`, title: L(`s${n}t`), body: LT(`s${n}b`) })),
  settings: settings('The thread', { anchorId: 'story', theme: 'light' }),
}

const currentlySection = {
  _key: 'now',
  _type: 'currentlySection',
  eyebrow: L('cuBrow'),
  title: L('cuTitle'),
  updatedLabel: lit('Updated August 2026', '更新于 2026 年 8 月'),
  items: [1, 2, 3, 4, 5].map((n) => ({ _key: `now${n}`, label: L(`cu${n}t`), body: LT(`cu${n}b`) })),
  settings: settings('Currently', { anchorId: 'now', theme: 'cream' }),
}

const ctaSection = (key, extra = {}) => ({
  _key: key,
  _type: 'ctaSection',
  eyebrow: L('coBrow'),
  title: L('coTitle'),
  body: LT('coBody'),
  // Each button names an intent; the address comes from Global settings. Until those
  // are filled in the buttons stay hidden rather than linking nowhere.
  actions: [
    { _key: 'a1', label: L('coCta1'), intent: 'email', style: 'gold' },
    { _key: 'a2', label: L('coCta2'), intent: 'social', platform: 'linkedin', style: 'ghost' },
    { _key: 'a3', label: L('coCta3'), intent: 'resume', style: 'ghost' },
  ],
  settings: settings('Closing CTA', { anchorId: 'contact', theme: 'dark', align: 'center' }),
  ...extra,
})

const experienceSection = (key, extra = {}) => ({
  _key: key,
  _type: 'experienceSection',
  eyebrow: L('exBrow'),
  title: L('exTitle'),
  source: 'auto',
  variant: 'cardsAndList',
  settings: settings('Experience', { anchorId: 'experience', theme: 'light' }),
  ...extra,
})

/* ----------------------------------------------------------------------- pages */

const pages = [
  {
    _id: 'page.home',
    title: 'Homepage',
    slug: '/',
    seoTitle: lit(
      'Yisen Lu — Product, business and the part where things get built',
      '卢一森 —— 产品、商业,以及把东西真正做出来的那部分'
    ),
    seoDescription: LT('nuNote'),
    // The homepage is a trailer, not the whole film: an opening, proof, three
    // featured roles, and a way to get in touch. Depth lives on the subpages.
    sections: [
      heroSection,
      statsSection,
      experienceSection('experience-teaser', {
        variant: 'cards',
        limit: 3,
        settings: settings('Featured experience', { anchorId: 'experience', theme: 'light' }),
      }),
      ctaSection('contact'),
    ],
  },
  {
    _id: 'page.about',
    title: 'About',
    slug: 'about',
    seoTitle: lit('About — Yisen Lu', '关于 —— 卢一森'),
    seoDescription: LT('thLede'),
    sections: [introSection, currentlySection, ctaSection('contact')],
  },
  {
    _id: 'page.experience',
    title: 'Experience',
    slug: 'experience',
    seoTitle: lit('Experience — Yisen Lu', '经历 —— 卢一森'),
    seoDescription: LT('exTitle'),
    sections: [
      experienceSection('experience-full', {
        lede: litT(
          'Five roles across consulting, sports marketing, operations and digital product. Different rooms, the same job.',
          '五段经历,横跨咨询、体育营销、运营和数字产品。房间不一样,做的事情是同一件。'
        ),
      }),
      statsSection,
      ctaSection('contact'),
    ],
  },
  {
    _id: 'page.contact',
    title: 'Contact',
    slug: 'contact',
    seoTitle: lit('Contact — Yisen Lu', '联系 —— 卢一森'),
    seoDescription: LT('coBody'),
    sections: [ctaSection('contact', { settings: settings('Contact', { theme: 'dark', align: 'center', spacing: 'large' }) })],
  },
]

const pageDocs = pages.map((p) => ({
  _id: p._id,
  _type: 'page',
  title: p.title,
  slug: { _type: 'slug', current: p.slug },
  seoTitle: p.seoTitle,
  seoDescription: p.seoDescription,
  sections: p.sections,
}))

/* -------------------------------------------------------------------- globals */

const globalSettings = {
  _id: 'globalSettings',
  _type: 'globalSettings',
  name: 'Yisen Lu',
  nameLocal: '卢一森',
  currentRole: L('ex1r'),
  currentLocation: lit('Singapore', '新加坡'),
  availability: L('uAvail'),
  shortBio: LT('thLede'),
  seoTitle: lit(
    'Yisen Lu — Product, business and the part where things get built',
    '卢一森 —— 产品、商业,以及把东西真正做出来的那部分'
  ),
  seoDescription: LT('nuNote'),
  // Email and social links stay empty: the prototype had them as [NEED CONTENT]
  // placeholders, and inventing them would be worse than a gap.
  socialLinks: [],
}

const navigation = {
  _id: 'navigation',
  _type: 'navigation',
  items: [
    { _key: 'n1', label: L('nAbout'), href: '/about', emphasis: 'plain', hidden: false },
    { _key: 'n2', label: L('nExp'), href: '/experience', emphasis: 'plain', hidden: false },
    { _key: 'n3', label: L('nContact'), href: '/contact', emphasis: 'plain', hidden: false },
    // Résumé points at the PDF once one is uploaded under Global settings.
    { _key: 'n4', label: L('nResume'), href: '/contact', emphasis: 'gold', hidden: false },
  ],
  footerStatement: LT('ftState'),
  footerNote: L('ftMade'),
  copyright: lit('© 2026 Yisen Lu', '© 2026 卢一森'),
}

/* ------------------------------------------------------------------------ run */

const all = [...experienceDocs, ...pageDocs, globalSettings, navigation]

try {
  if (REPLACE) {
    // Drafts are separate documents. Deleting only the published copy leaves a
    // draft behind that the studio then shows as pending edits to a page that no
    // longer looks like that.
    const ids = all.flatMap((d) => [d._id, `drafts.${d._id}`])
    await ids.reduce((t, id) => t.delete(id), client.transaction()).commit()
    console.log(`· cleared ${all.length} documents (and any drafts)`)
  }

  await all.reduce((t, doc) => t.createIfNotExists(doc), client.transaction()).commit()

  console.log(`✓ Seeded ${all.length} documents into ${projectId}/${dataset}`)
  console.log(`  ${experienceDocs.length} experience · ${pageDocs.length} pages · globalSettings · navigation`)
  console.log('\n  Pages:')
  pages.forEach((p) => console.log(`    ${p.slug === '/' ? '/' : '/' + p.slug}  (${p.sections.length} sections)`))
  console.log('\n  Still empty on purpose — fill these in the studio:')
  console.log('    · Global settings → Email, Social links, Résumé PDF')
  console.log('    · Hero → Portrait image (Show portrait is off until one exists)')
} catch (err) {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
}
