/**
 * The words that introduce me — the paragraph a stranger reads first.
 *
 * `project-content.mjs` holds the case studies and `photo-content.mjs` the pictures;
 * this is the third of the same kind, for the copy that is about the person rather
 * than about a piece of work. It is kept here rather than typed into the studio
 * because the same sentences appear in five places at once — the hero, the About
 * page, the site-wide bio, and the search-result description on two pages — and the
 * only way they stay the same sentence is if there is one copy of it.
 *
 * `npm run intro` writes them. Nothing else on those documents is touched.
 *
 * ── What changed, and why ────────────────────────────────────────────────────────
 *
 * These used to open on a degree: "a Japanese major who moved into product",
 * "International relations, then Japanese, then venture creation". Where somebody
 * studied is the least interesting true thing about them, and leading on it made a
 * reader spend the first sentence working out what the connection to product was
 * meant to be. So the opening is now the work: AI products, built fast enough that
 * the thing under test is the idea rather than the code — which is what the rest of
 * the site then goes on to show, and what the Currently panel has said all along.
 *
 * The languages have not gone anywhere; they are a line in the stats and a card on
 * the Playground, which is the size a working language actually is.
 */

const S = (copy) => ({ _type: 'localeString', ...copy })
const T = (copy) => ({ _type: 'localeText', ...copy })

/**
 * The hero paragraph.
 *
 * Two halves and a colon between them, because they are two different claims: the
 * things built with nobody asking, and the things delivered with somebody paying.
 * The self-directed half goes first — it is the half that is hard to fake.
 */
const INTRO = {
  en:
    "I'm Yisen Lu. I build AI products, fast enough that what gets tested is the idea " +
    'and not the code — an NBA prediction platform that settles every call itself, and ' +
    'a scheduling system now running inside a real tutoring centre. Alongside that: six ' +
    'enterprise website projects in parallel at Orfeostory, community football operations ' +
    'at Stranger Soccer, 20+ financial process documents written solo at Ernst & Young.',
  zh:
    '我是卢一森。我做 AI 产品，做得足够快，所以被验证的是想法，不是代码 —— 一个赛后自动结算的 ' +
    'NBA 预测平台，一套已经在真实机构里跑起来的排课系统。除此之外：在 Orfeostory 同时推进六个' +
    '企业网站项目，在 Stranger Soccer 做社区足球运营，在安永独立完成 20 多份财务流程文档。',
}

/**
 * The bio of record — the site-wide `shortBio`, and the lede on the About page.
 *
 * The list of rooms is the setup and "same job" is the payoff, so the list has to
 * stay a list of things that genuinely do not belong together. Dropping the degree
 * out of it costs nothing: consulting, sports marketing and operations already make
 * the point, and ending on AI products lands it in the present tense.
 */
const BIO = {
  en:
    'International relations, then venture creation at NUS. Consulting, sports marketing, ' +
    'operations, and now AI products. Different rooms, same job: work out what the actual ' +
    'problem is, find the opening, get the people and the pieces together, and make the ' +
    'thing exist.',
  zh:
    '国际关系学院，再到新国大风险创造。咨询、体育营销、运营，现在做 AI 产品。房间不一样，做的' +
    '事情是同一件：搞清楚真正的问题是什么，找到切口，把人和资源组织起来，然后把东西做出来。',
}

/** The tab, and the blue line in a search result. */
const SEO_TITLE = {
  en: 'Yisen Lu — AI products, and the part where they actually get built',
  zh: '卢一森 —— AI 产品，以及把东西真正做出来的那部分',
}

/**
 * The grey line under it.
 *
 * The old one was the Stats section's footnote — "Everything here comes from work
 * that shipped" — which reads as a caption with its picture missing once it is out
 * on its own in a search result. This one says who is being described and what they
 * are after, which is the job of that line.
 */
const SEO_DESCRIPTION = {
  en:
    'I build AI products, fast enough to test the idea rather than the code. NUS Venture ' +
    'Creation in Singapore, graduating January 2027, looking for product roles where the ' +
    'brief is still vague.',
  zh:
    '我做 AI 产品，做得足够快，被验证的是想法而不是代码。新加坡国立大学风险创造，2027 年 1 月' +
    '毕业，正在找需求还很模糊的产品岗位。',
}

/**
 * Where each of those lands.
 *
 * `set` is written onto the document itself; `sections` names a section by its own
 * `_key` and sets fields inside it, which is how the hero paragraph and the About
 * lede are reached. A key that is not on the page is reported rather than created —
 * a section renamed in the studio should say so, not silently take a new one.
 *
 * `page.home` and `page.about` carry their own SEO fields, and a page that sets them
 * wins over `globalSettings`. So the home page is given the same pair as the site
 * default rather than left to inherit: it already had its own copy of the old ones,
 * and half-updating that is how the two drift apart.
 */
const PLACEMENTS = [
  {
    _id: 'globalSettings',
    set: { shortBio: T(BIO), seoTitle: S(SEO_TITLE), seoDescription: T(SEO_DESCRIPTION) },
  },
  {
    _id: 'page.home',
    set: { seoTitle: S(SEO_TITLE), seoDescription: T(SEO_DESCRIPTION) },
    sections: { hero: { lede: T(INTRO) } },
  },
  {
    _id: 'page.about',
    // The About page describes itself with the bio rather than with the hero
    // paragraph: it is the page the bio is the lede of.
    set: { seoDescription: T(BIO) },
    sections: { story: { lede: T(BIO) } },
  },
]

export { INTRO, BIO, SEO_TITLE, SEO_DESCRIPTION, PLACEMENTS }
