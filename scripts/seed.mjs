/**
 * Seeds the dataset from the prototype's own copy.
 *
 * Run once against an empty dataset:
 *   SANITY_API_WRITE_TOKEN=... npm run seed
 *
 * Uses `createIfNotExists` with fixed IDs, so re-running will not overwrite edits
 * made in the studio. To start over, delete the documents first.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load .env.local without adding a dependency for it.
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
  console.error('✗ SANITY_API_WRITE_TOKEN is required (an Editor token from sanity.io/manage).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-08-07', useCdn: false })

const C = JSON.parse(readFileSync(join(root, 'design-reference/content.en-zh.json'), 'utf8'))
/** Bilingual value straight from the prototype. */
const L = (key) => ({ _type: 'localeString', en: C[key]?.en ?? '', zh: C[key]?.zh ?? '' })
const LT = (key) => ({ _type: 'localeText', en: C[key]?.en ?? '', zh: C[key]?.zh ?? '' })
const lit = (en, zh) => ({ _type: 'localeString', en, zh })

/**
 * The prototype left the English hero paragraph holding the Chinese text, so
 * English visitors read Chinese. Translated here from the zh version rather than
 * shipping the bug — review the wording, it is a translation, not your words.
 */
const HERO_LEDE_EN =
  "I'm Yisen Lu — a Japanese major who moved into product. Six enterprise website projects running in parallel at Orfeostory, community football operations at Stranger Soccer, 20+ financial process documents written solo at Ernst & Young. In my own time I built an NBA prediction platform, and a scheduling system for my mother's business."

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

const homepage = {
  _id: 'page.home',
  _type: 'page',
  title: 'Homepage',
  slug: { _type: 'slug', current: '/' },
  seoTitle: lit(
    'Yisen Lu — Product, business and the part where things get built',
    '卢一森 —— 产品、商业,以及把东西真正做出来的那部分'
  ),
  seoDescription: LT('nuNote'),
  sections: [
    {
      _key: 'hero',
      _type: 'heroSection',
      eyebrow: L('heroBrow'),
      headlineLine1: L('h1a'),
      headlineLine2: L('h1b'),
      rotatingWords: [lit('built', '做出来'), lit('shipped', '交付'), lit('used', '被用起来')],
      lede: { _type: 'localeText', en: HERO_LEDE_EN, zh: C.heroLede?.zh ?? '' },
      ctas: [
        { _key: 'cta1', label: L('ctaWork'), href: '#experience', style: 'gold' },
        { _key: 'cta2', label: L('ctaStory'), href: '#story', style: 'ghost' },
      ],
      metaItems: [
        lit('1.29°N 103.85°E', '1.29°N 103.85°E'),
        lit('中文 · ENGLISH · 日本語', '中文 · ENGLISH · 日本語'),
        lit("MSC VENTURE CREATION '27", '风险创造硕士 · 2027 届'),
      ],
      showPortrait: false,
      portraitBadge: L('portraitBadge'),
      rotateHeadlineWord: true,
      settings: { _type: 'sectionSettings', label: 'Hero', anchorId: 'top', theme: 'dark' },
    },
    {
      _key: 'experience',
      _type: 'experienceSection',
      eyebrow: L('exBrow'),
      title: L('exTitle'),
      source: 'auto',
      variant: 'cardsAndList',
      settings: {
        _type: 'sectionSettings',
        label: 'Experience',
        anchorId: 'experience',
        theme: 'light',
        spacing: 'normal',
        align: 'left',
        animation: 'default',
      },
    },
  ],
}

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
  // Email and social links are intentionally empty: the prototype had them as
  // [NEED CONTENT] placeholders, and inventing them would be worse than a gap.
  socialLinks: [],
}

const navigation = {
  _id: 'navigation',
  _type: 'navigation',
  items: [
    { _key: 'n1', label: L('nAbout'), href: '#story', emphasis: 'plain', hidden: false },
    { _key: 'n2', label: L('nExp'), href: '#experience', emphasis: 'plain', hidden: false },
    { _key: 'n3', label: L('nProj'), href: '#projects', emphasis: 'plain', hidden: false },
    { _key: 'n4', label: L('nPlay'), href: '#beyond', emphasis: 'plain', hidden: false },
    { _key: 'n5', label: L('nNow'), href: '#now', emphasis: 'plain', hidden: false },
    { _key: 'n6', label: L('nContact'), href: '#contact', emphasis: 'gold', hidden: false },
  ],
  footerStatement: LT('ftState'),
  footerNote: L('ftMade'),
  copyright: lit('© 2026 Yisen Lu', '© 2026 卢一森'),
}

const all = [...experienceDocs, homepage, globalSettings, navigation]

const tx = all.reduce((t, doc) => t.createIfNotExists(doc), client.transaction())

try {
  await tx.commit()
  console.log(`✓ Seeded ${all.length} documents into ${projectId}/${dataset}`)
  console.log(`  ${experienceDocs.length} experience · 1 page · 1 globalSettings · 1 navigation`)
  console.log('\n  Still empty on purpose — fill these in the studio:')
  console.log('    · Global settings → Email, Social links, Résumé PDF')
  console.log('    · Hero → Portrait image (Show portrait is off until one exists)')
} catch (err) {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
}
