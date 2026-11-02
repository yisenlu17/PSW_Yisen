/**
 * The case studies themselves — four projects, both languages, no transport.
 *
 * Kept apart from the script that writes them so the same words can be rendered
 * somewhere else without a Sanity token: `project-detail.mjs` patches them into the
 * dataset, `preview-detail.mjs` turns them into a page you can look at first.
 *
 * The write-up is authored once as bilingual pairs and split into `body` (English)
 * and `bodyZh` at the end, which is what keeps the two languages structurally
 * identical — same sections, same chains, same order.
 *
 * The screenshots are named here too, by filename rather than by asset id: a cover per
 * project and an `IMG` wherever a picture belongs in the argument. `media.mjs` uploads
 * what this file asks for and nothing else.
 *
 * So are the links a project offers — the entrances to 智排, the site 我是懂球王 runs
 * on — and, at the foot, the two accounts in the "Also running" strip, which are a
 * 抖音号 each and nothing more.
 */

/* ------------------------------------------------------------------ authoring */

const S = (en, zh) => ({ _type: 'localeString', en, zh })
const T = (en, zh) => ({ _type: 'localeText', en, zh })

/**
 * A link, rendered as a button at the top of the detail page.
 *
 * Named by who the door is for rather than by what is behind it: 智排 has two of
 * them, and "Centre console" and "Student & teacher portal" is the distinction a
 * visitor needs — the two URLs on their own say nothing. A project with no public
 * address gets no link at all rather than a dead one, and the page says so itself.
 */
const LINK = (kind, en, zh, url) => ({ _type: 'projectLink', kind, label: S(en, zh), url })

/** The write-up, written once as bilingual pairs and split into two at the end. */
const H = (en, zh) => ({ kind: 'block', style: 'h3', en, zh })
const P = (en, zh) => ({ kind: 'block', style: 'normal', en, zh })
const Q = (en, zh) => ({ kind: 'block', style: 'blockquote', en, zh })
/** Bulleted list. Each item is an [en, zh] pair; `**text**` inside one goes bold. */
const UL = (...items) => ({ kind: 'list', items })
const CHAIN = (label, en, zh) => ({ kind: 'flow', variant: 'chain', label, en, zh })
const SET = (label, en, zh) => ({ kind: 'flow', variant: 'set', label, en, zh })

/**
 * A screenshot, placed in the write-up rather than collected at the foot of the page.
 *
 * `file` names a file under `media/project/` and not a Sanity asset, so the picture is chosen
 * next to the paragraph it belongs under and neither script here needs the dataset to
 * be able to read this file. `media.mjs` puts the file in the dataset;
 * `project-detail.mjs` looks the asset up by that filename as it writes. An image
 * with nothing uploaded behind it is left out rather than written as a hole.
 */
const IMG = (file, alt, en, zh) => ({ kind: 'image', file, alt, en, zh })

/**
 * `**bold**` is the only inline mark these write-ups need — a bulleted definition
 * list ("**Player Side** — sign-up, matchmaking, …") is how three product surfaces
 * read best in one column, and it is the one thing a plain paragraph cannot say.
 */
function spans(text, key) {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => ({
      _type: 'span',
      _key: `${key}s${i}`,
      text: part,
      marks: i % 2 === 1 ? ['strong'] : [],
    }))
    .filter((span) => span.text.length > 0)
}

const block = (key, style, text, listItem) => ({
  _type: 'block',
  _key: key,
  style,
  markDefs: [],
  ...(listItem ? { listItem, level: 1 } : {}),
  children: spans(text, key),
})

/**
 * Turns the bilingual outline into one language's Portable Text array.
 *
 * `assets` maps a filename to the id of the image asset that came from it. Both
 * languages are given the same map, so a screenshot lands at the same point in the
 * English and the Chinese write-up or in neither.
 */
function writeUp(nodes, lang, assets = {}) {
  const out = []
  nodes.forEach((node, i) => {
    const key = `b${i}`
    if (node.kind === 'block') {
      out.push(block(key, node.style, node[lang]))
    } else if (node.kind === 'list') {
      node.items.forEach((item, j) => {
        out.push(block(`${key}i${j}`, 'normal', lang === 'zh' ? item[1] : item[0], 'bullet'))
      })
    } else if (node.kind === 'image') {
      // Skipped rather than written empty: an image block with no asset renders as a
      // gap on the page and reads as a bug in the studio.
      const asset = assets[node.file]
      if (!asset) return
      out.push({
        _type: 'image',
        _key: key,
        // Read by the preview, which has the files but not the dataset, and stripped
        // by the script that writes — the studio would show it as an unknown field.
        _file: node.file,
        asset: { _type: 'reference', _ref: asset },
        alt: node.alt,
        caption: { _type: 'localeString', en: node.en, zh: node.zh },
      })
    } else if (node.kind === 'flow') {
      out.push({
        _type: 'flowSteps',
        _key: key,
        variant: node.variant,
        ...(node.label ? { label: node.label[lang] } : {}),
        steps: node[lang],
      })
    }
  })
  return out
}

/** Arrays of objects need a key each, and a stable one keeps re-runs idempotent. */
const keyed = (prefix, items) => items.map((item, i) => ({ ...item, _key: `${prefix}${i}` }))
const refs = (ids) => ids.map((id, i) => ({ _type: 'reference', _key: `rel${i}`, _ref: id }))

/* ------------------------------------------------------------- Exploremehere */

const EXPLOREMEHERE = [
  H('Why I built it', '为什么做 Exploremehere'),
  P(
    'A résumé is one page, read in seconds. What it cannot hold is the part an interviewer or an admissions officer actually decides on: why this person, for this role.',
    '简历只有一页，被看的时间以秒计。它装不下的，恰恰是面试官和招生官真正拿来做决定的那部分——为什么是这个人，为什么适合这个岗位。'
  ),
  P(
    'Most people are not short of experience. They are short of words for it — months of work reduced to one line, and the same document sent to every job and every programme.',
    '大多数人并不缺经历，缺的是把经历讲清楚的话——几个月的工作在简历上只剩一行，同一份简历被投给每一个岗位、每一个项目。'
  ),
  P(
    'So I built Exploremehere. Upload a résumé in Chinese, English or both; the AI asks about what it only mentions in passing, then builds a bilingual personal website you can send — and a version of it tailored to each job or programme.',
    '所以我做了 Exploremehere。上传中文或英文简历（或两份都传），AI 会追问简历上一笔带过的经历，生成一个可以直接发出去的中英双语个人网站，并为每个岗位、每个留学项目生成一份定制版本。'
  ),
  IMG(
    'exploremehere-site.png',
    'A finished Exploremehere site: a dark navy personal website with a name in the bar, a headline, two buttons and a city and languages line under them.',
    'What a user ends up with: a personal website in either language, at an address of their own, in one of 23 templates. This is the sample site the product shows to new users.',
    '用户最后拿到的东西：一个中英双语的个人网站，有自己的网址，23 套模板任选。这是产品给新用户看的示例网站。'
  ),

  H('The first rule: AI that does not make things up', '第一条规则：AI 不能编'),
  P(
    'An AI résumé tool can make anyone sound impressive, which is exactly why a reader stops believing it. So the first thing I designed was what the AI is not allowed to do.',
    'AI 简历工具可以让任何人听起来都很厉害——这也正是读的人不再相信它的原因。所以我最先设计的，是 AI 不允许做什么。'
  ),
  UL(
    [
      '**Facts are locked.** Companies, titles, dates, schools and degrees are never changed.',
      '**事实锁定**：公司、职位、时间、学校和学位一律不改。',
    ],
    [
      '**Inferences are opt-in.** Anything the AI infers goes in only once the user ticks it.',
      '**推测要勾选**：AI 推测出来的内容，用户勾选了才会写入。',
    ],
    [
      '**Numbers stay blank.** The AI never invents a metric; it leaves the space for the user to fill.',
      '**数字留空**：AI 不编任何指标，空着等用户自己填。',
    ]
  ),
  P(
    'Every AI-written line then passes rule checks, and a model fact-checks it against the user’s own entries. If it fails, the original words stay.',
    '每段 AI 写的文字先过规则检查，再由模型对照用户自己的经历核对；过不了，就保留原来的文字。'
  ),

  H('Boost: one line into a story', '开挂模式：把一句话挖成一段经历'),
  CHAIN(
    { en: 'How Boost works', zh: '开挂模式的流程' },
    ['Read', 'Ask', 'Infer', 'Rewrite', 'Interactive work'],
    ['读取', '追问', '推测', '改写', '交互作品']
  ),
  P(
    'Boost takes one entry at a time, finds what is thin or missing — context, duties, methods, tools, results — and asks about exactly that. What the user can answer, it helps them say clearly. What they cannot, it fills in from what someone in that role usually does, and they decide what stays.',
    '开挂模式一次处理一段经历，找出哪里单薄、哪里缺失——背景、职责、方法、工具、结果——然后只追问这些。用户答得上来的，帮他说清楚；答不上来的，按这个岗位通常会做的事给出推测，留不留由用户决定。'
  ),
  IMG(
    'exploremehere-boost.png',
    'A Boost session on the entry "Helped produce weekly programmes": five steps across the top, and context, duties, methods, tools and results each rated thin or missing.',
    'A Boost session on one line, "Helped produce weekly programmes". Before anything is rewritten, it shows how little the line actually says — context and duties thin, methods, tools and results missing — and the questions start from there.',
    '开挂模式处理一句「协助制作每周节目」。改写之前，它先指出这句话到底说了多少：背景和职责单薄，方法、工具和结果完全没有——追问就从这里开始。'
  ),

  H('Tailoring: one job, one version', '定制版本：一个岗位，一个版本'),
  CHAIN(
    null,
    ['Add a job', 'Analyse it', 'Find the proof', 'Arrange a version'],
    ['添加岗位', '分析岗位', '匹配证据', '生成定制版本']
  ),
  P(
    'Paste a job ad, or pick a programme. The AI reads what they ask for, finds the user’s proof for each part, and arranges a version: what leads, what waits. The main site stays as it is, and every version has an address of its own. For study abroad, it writes to the programme’s own published requirements.',
    '贴一份岗位描述，或者选一个留学项目。AI 读出对方要什么，为每一条找到用户自己的证据，再排出一个版本：什么放前面，什么往后放。主网站保持不变，每个版本都有自己的网址。留学方向则按项目官网公布的要求来写。'
  ),
  IMG(
    'exploremehere-tailor.png',
    'Tailoring for a junior product designer role: the ad’s requirements on the left, each marked covered with its proof, and the tailored version on the right with its own address.',
    'The ad on the left, read line by line, with the proof for each requirement named. The version on the right is what comes out of it — the entry that answers the ad moved to the top, at its own address.',
    '左边是岗位描述，逐条读出要求，并标出每一条的证据是哪段经历。右边是据此排出的版本——最对口的经历被挪到最前面，有自己的网址。'
  ),

  H('An edition for agencies', '机构版'),
  P(
    'The people who help students apply — career services, study-abroad agencies, schools — need to work on the same material with them. So there is an agency edition: an organisation buys seats, each student gets the full product, and advisers comment, review and move the service along in one workspace.',
    '帮学生申请的人——就业指导、留学机构、学校——也需要和学生一起打磨同一份材料。所以有了机构版：机构按席位购买，每个学生拿到完整的产品，顾问在同一个工作台里批注、审核、推进服务。'
  ),
  UL(
    ['**Three kinds of organisation** — career, study abroad, general', '**三类机构**：就业、留学、普通'],
    [
      '**Two plans** — seats on their own, or seats with a collaboration space for advisers',
      '**两种方案**：席位版，以及带顾问协作空间的协作版',
    ],
    [
      '**A 16-step study-abroad service flow**, from the first enquiry to arrival',
      '**16 步留学服务流程**，从咨询登记一直到抵达',
    ]
  ),
  P(
    'The website always belongs to the student. An organisation never sees résumé files or unpublished drafts.',
    '网站始终归学生自己，机构看不到简历原件和未发布的草稿。'
  ),
  IMG(
    'exploremehere-business.png',
    'The Exploremehere page for organisations: who it is for, and the two plans, seats and collaboration, priced per seat for six or twelve months.',
    'The two plans as an organisation sees them: seats alone, or seats with a space where advisers work on students’ drafts with them.',
    '机构看到的两种方案：只买席位，或者席位加一个顾问和学生一起改稿的协作空间。'
  ),

  H('Building it', '怎么做出来的'),
  P(
    'I designed and built it end to end on my own, working with AI coding agents: Next.js 16 and React 19 on Vercel, Supabase Postgres with row-level security, the Claude API with OpenAI as a fallback, Creem for payments and Resend for email. Visit stats use no cookies and no tracking.',
    '从产品设计到全栈开发都由我一个人完成，和 AI 编程助手协作：Next.js 16 + React 19 部署在 Vercel，Supabase Postgres 加行级权限管理数据，Claude API 为主、OpenAI 备用，Creem 收款，Resend 发邮件。访问统计不用 cookie、不做追踪。'
  ),
  P(
    'In September 2026 I rebuilt it as a multi-tenant platform. In the two months after, I shipped paid plans, the agency edition, the Mimi assistant, Boost, and the study-abroad and career service flows — 1,700+ commits on main.',
    '2026 年 9 月重构为多租户平台。之后两个月里陆续上线付费方案、机构版、助手觅觅、开挂模式，以及留学和就业服务流程，主分支 1,700 多次提交。'
  ),

  H('Outcome', 'Outcome'),
  P(
    'Exploremehere is live at exploremehere.com, with a free site for anyone, paid plans and the agency edition open.',
    'Exploremehere 已在 exploremehere.com 上线，个人免费版、付费方案和机构版都已开放。'
  ),
  Q(
    'With AI in the product, the real design work is deciding what it must never do. Trust is the feature.',
    '产品里有了 AI，真正的设计工作是规定它绝对不能做什么。信任本身就是功能。'
  ),
]

/* ---------------------------------------------------------------- 我是懂球王 */

const DONGQIUWANG = [
  H('It started with something every fan does', '从一个球迷洞察开始'),
  P(
    'There is a funny problem in every basketball community: everyone is sure they know the game, and almost every opinion evaporates the moment it is said. Nothing light enough to use daily was keeping a record of who was actually right.',
    '篮球社区里有一个很有意思的问题：每个人都觉得自己「懂球」，但绝大多数观点说完就过去了——没有一个足够轻的产品能够长期记录、验证并量化一个球迷的判断。'
  ),
  P(
    'So I designed 我是懂球王: a daily prediction platform for NBA fans that settles itself, and turns what you called into a standing you grow.',
    '因此我设计了「我是懂球王」——一个面向 NBA 球迷的每日预测 + 自动结算 + 懂球身份成长平台。'
  ),
  P(
    'You take a side and call the game before tip-off, the system settles it afterwards, and the score, hit rate, streak, level and leaderboard position keep accumulating. "I know ball" stops being an opinion and becomes a digital identity that can be recorded, compared and shared.',
    '用户可以在赛前完成比赛站队和预测，赛后系统自动结算，并持续积累懂王分、命中率、连胜、等级和排行榜，让「我懂球」从一句观点变成可记录、可比较、可分享的数字身份。'
  ),

  IMG(
    'dongqiuwang-news-poll.png',
    'A news item on 我是懂球王 with its interactive question underneath — two sides, a split bar and a deadline.',
    'A call has a side and a deadline. The question hangs under the news item it came out of, the bar moves as people take their side, and when it closes the side that drew the crowd scores a point each.',
    '一次判断有一个立场，也有一个截止时间。互动题就挂在它来自的那条新闻下面，站队的人越多进度条越偏，截止时人多的一方每人 +1 懂王分。'
  ),

  H('Taking it from 0 to 1', '从 0 到 1 搭建产品'),
  P(
    'I ran the whole path myself, from defining the product to getting it built.',
    '我独立完成了从产品定义到开发落地的主要流程。'
  ),
  CHAIN(
    { en: 'How it got built', zh: '从需求到落地' },
    [
      'User need',
      'PRD',
      'Information architecture',
      'Prototypes',
      'Data model',
      'Feature breakdown',
      'AI-assisted development',
      'Testing & iteration',
    ],
    ['用户需求', 'PRD', '信息架构', '页面原型', '数据模型', '功能拆分', 'AI 辅助开发', '测试与迭代']
  ),
  P(
    'The PRD is where I fixed the MVP. I deliberately cut the heavy things — a news feed, chat rooms, live streaming, a full community — and kept the product on one loop:',
    '我先通过 PRD 明确 MVP，主动砍掉资讯流、聊天室、直播、复杂社区等重功能，把产品聚焦在一条闭环上：'
  ),
  CHAIN(
    { en: 'The core loop', zh: '核心闭环' },
    [
      'Fixtures sync',
      'Game room created',
      'Users pick',
      'Picks locked',
      'Automatic settlement',
      'Points & leaderboard update',
    ],
    ['比赛同步', '自动生成比赛房间', '用户预测', '比赛封盘', '自动结算', '积分与排行榜更新']
  ),
  IMG(
    'dongqiuwang-card.png',
    'The 懂球卡 on 我是懂球王: 懂王 score, career honour, badges, hit rate, games played, current and best streak, and the last five games.',
    'Where the loop puts what it produces. Score, honour, badges, hit rate, streak, the last five games — the thing a fan is actually accumulating, and the thing they screenshot and send to the group chat.',
    '闭环最后落在这张卡上：懂王分、生涯荣誉值、徽章、命中率、当前与最高连胜、最近 5 场。球迷真正在积累的是它，会截图发到群里的也是它。'
  ),
  P(
    'From there I used Claude and Codex to generate the first pass of the design and the code, then went through it feature by feature — checking the business logic, reworking the interactions, finishing the build.',
    '随后利用 Claude / Codex 等 AI 工具生成设计和代码初版，再逐个功能检查业务逻辑、修改交互并完成开发。'
  ),
  P(
    'Users, games, picks and points sit in PostgreSQL behind Prisma, the NBA data comes from the BallDontLie API, and the whole thing runs on Vercel.',
    '产品使用 PostgreSQL + Prisma 管理用户、比赛、预测和积分数据，通过 BallDontLie API 获取 NBA 数据，并部署在 Vercel。'
  ),

  H('The hardest part: running it without staff', '最大的问题：如何让产品不依赖人工运营？'),
  P(
    'If someone had to create every game by hand, update the score and settle the picks, the product could never grow past the person doing it.',
    '最初如果每天手动创建比赛、更新比分、结算预测，产品几乎无法规模化。'
  ),
  P('So I made that the goal:', '因此我把核心目标定义成：'),
  Q(
    'In the normal case, a game goes from appearing to being settled without an administrator touching it.',
    '正常情况下，一场比赛从出现到最终结算都不需要管理员参与。'
  ),
  P(
    'An external cron job syncs the NBA schedule. While a game is running, the score and its state update by the minute. When it ends, settlement fires on its own and points, streaks and the leaderboard move with it.',
    '我设计了外部 Cron Job 定时同步 NBA 赛程；比赛进行时进入分钟级比分与状态更新；比赛结束后自动触发预测结算，并同步更新用户积分、连胜和排行榜。'
  ),
  P(
    'The admin panel is no longer where the product is operated. It exists for the exceptions: monitoring, correcting data, re-settling a game.',
    '后台因此不再承担日常运营，而主要负责异常监控、数据修正和重新结算。'
  ),
  P(
    'Plenty went wrong on the way — unstable status data from the API, scheduled jobs, double settlement, postponed games, and how slowly all of it loads from inside China. I turned each of those into its own exception state with a fallback path, rather than a game somebody has to go and fix.',
    '开发过程中还遇到了 API 数据状态不稳定、定时任务、重复结算、比赛延期以及国内访问速度等问题。我把这些问题拆成独立的异常状态和兜底逻辑，而不是依赖人工逐场处理。'
  ),

  H('Outcome', 'Outcome'),
  P(
    'It is live at woshidongqiuwang.com and running, with the core loop working end to end.',
    '目前已在 woshidongqiuwang.com 上线运营，核心闭环完整跑通。'
  ),
  P(
    'This is the project where I finally did a whole one, end to end.',
    '这个项目让我真正完成了一次完整的产品实践：'
  ),
  Q(
    'Not writing a PRD and stopping there — starting from one user insight and assembling requirements, interactions, a database, an API, scheduled jobs and exception handling into something that actually runs.',
    '不是只写一份 PRD，而是从一个用户洞察出发，把需求、交互、数据库、API、自动化任务和异常机制组合成一个真正可以运行的产品。'
  ),
]

/* ------------------------------------------------------------------ Just Hoop */

const JUST_HOOP = [
  H('Why Just Hoop', '为什么做 Just Hoop？'),
  P(
    'I have played a lot of pick-up basketball, and getting a game anyone takes seriously turns out to be harder than it sounds.',
    '我长期参与线下篮球，后来发现普通球友想打一场「认真一点」的比赛并不容易。'
  ),
  P(
    'Organising through a group chat or a circle of friends hits the same structural problems every time:',
    '微信群和熟人组局存在很多结构性问题：'
  ),
  UL(
    ['Levels do not match', '水平不匹配'],
    ['People drop out at the last minute', '临时放鸽子'],
    ['Collecting the money is a chore', '收款麻烦'],
    ['Nothing is recorded, so nothing accumulates', '没有长期比赛记录'],
    [
      '**And the big one: with no referee, the game ends in an argument about a foul or the score**',
      '**更重要的是——没有裁判时，很多比赛最后都会陷入犯规和比分争议**',
    ]
  ),
  P(
    'So I started designing Just Hoop, to turn ordinary pick-up games into something else:',
    '因此我开始设计 Just Hoop，希望把普通野球升级成一种：'
  ),
  Q(
    'A standard basketball game that is easy to join, matched by level, fairly officiated, and recorded when it ends.',
    '容易加入、水平匹配、公平判罚、结果可记录的标准化篮球比赛。'
  ),

  H('How the product is put together', '产品是怎么搭起来的？'),
  P(
    'First I broke one offline game down into everything that has to happen:',
    '我先把一场线下比赛完整拆成：'
  ),
  CHAIN(
    null,
    ['Sign-up', 'Matchmaking', 'Game formed', 'Tip-off', 'Officiating', 'Scoring', 'Result', 'Elo', 'Appeals'],
    ['报名', '匹配', '组局', '开赛', '判罚', '计分', '赛果', 'Elo', '申诉']
  ),
  P('Then designed three products around that line:', '再围绕这条链路设计三个产品端：'),
  UL(
    [
      '**Player Side** — sign-up, matchmaking, the game lobby, fixtures and a personal record',
      '**Player Side**：报名、匹配、比赛大厅、赛程与个人战绩',
    ],
    [
      '**Referee Side** — starting the game, the clock, scoring, fouls, possession and submitting the result',
      '**Referee Side**：开赛、计时、计分、犯规、球权和赛果提交',
    ],
    [
      '**Admin Side** — referee vetting, rostering, match oversight, appeals, a credit system and the data dashboard',
      '**Admin Side**：裁判审核、排班、比赛监管、申诉、信用体系与数据看板',
    ]
  ),
  P(
    'So that players at different levels build a real competitive record over time, each mode carries its own independent Elo rating, and I have kept iterating the rules for 1v1, 3v3 and king-of-the-court.',
    '为了让不同水平的玩家长期形成竞技体系，我还设计了不同模式独立计算的 Elo Rating System，并针对 1V1、3V3 和多人擂台不断迭代比赛规则。'
  ),

  IMG(
    'just-hoop-matchmaking.png',
    'The Just Hoop player side mid-search: ranked or casual, 1v1 or 3v3, filters for date, time, place and tier, and the rooms still open.',
    'The player side, mid-search: ranked or casual, 1v1 or 3v3, filtered by date, time, place and tier, with same-or-adjacent tier left on. Nothing open that fits is a state of its own — it offers to hold the same terms, open a waiting room on them, and put a referee on it once the room fills.',
    '球员端的找局界面：排位或匹配、1V1 或 3V3，按日期、时段、地点和段位筛选，默认只看同段或相邻段位。一个都不合适也是一种状态——系统会保留刚才的条件开一个等待房，人满后自动派裁判。'
  ),

  H(
    'The decision that mattered most: what if the AI referee cannot be built yet?',
    '最关键的产品决策：AI 裁判做不了怎么办？'
  ),
  P(
    'My long-term goal was never remote officiating. It was an AI referee.',
    '我的长期目标其实不是远程裁判，而是 AI Referee。'
  ),
  P(
    'But researching it, single-camera computer vision is not yet accurate enough to judge body contact, out-of-bounds, fouls and the more complicated basketball rules reliably — not accurate enough to be handed the outcome of a real game.',
    '但在研究过程中我发现，目前依靠单机位计算机视觉稳定判断身体接触、出界、犯规和复杂篮球规则，技术准确率还不足以直接承担真实比赛的裁决。'
  ),
  P(
    'Waiting for that to mature could mean years with nothing validated. So I did not drop the direction — I redrew the route to it:',
    '如果等待 AI 完全成熟，产品可能几年都无法验证。所以我没有放弃这个方向，而是重新设计了一条渐进式路线：'
  ),
  CHAIN(
    { en: 'The route', zh: '渐进式路线' },
    ['Remote human referee', 'AI-assisted referee', 'AI referee'],
    ['远程真人裁判', 'AI 辅助裁判', 'AI 裁判']
  ),
  P(
    'For now a remote human referee handles scoring, possession and disputed calls from the video feed. That is human-in-the-loop, and it puts the real question first: can a remote match official actually solve pick-up basketball’s officiating problem?',
    '现阶段由远程真人裁判通过视频画面完成计分、球权和争议判定，用 Human-in-the-Loop 的方式先验证「远程数字比赛官」是否能够真正解决野球判罚问题。'
  ),
  IMG(
    'just-hoop-referee-console.png',
    'The Just Hoop referee console: score for either side, the game clock, a 12-second reset, fouls, attendance and a running feed.',
    'What that referee actually works from. Scoring, fouls and possession are one key each, the 12-second clock resets itself after every event so nobody has to run it, and the feed down the right is what an appeal gets argued from afterwards.',
    '远程裁判真正在用的执裁台：得分、犯规、球权各有快捷键，12 秒进攻计时在每次事件后自动重置，不需要裁判去管；右侧的实况流就是之后申诉时用来复盘的依据。'
  ),

  P(
    'Meanwhile the architecture has had room for what comes next from the start: computer vision, player and ball tracking, event detection, a rules engine and multi-camera calls.',
    '与此同时，产品架构从一开始就为未来的计算机视觉、球员/篮球追踪、事件检测、规则引擎和多机位 AI 判罚保留升级空间。'
  ),

  H('Outcome', 'Outcome'),
  P(
    'Just Hoop is still in development, with the MVP pilot being designed.',
    'Just Hoop 目前仍处于产品开发和 MVP 试点设计阶段。'
  ),
  P(
    'What it gave me was not a stack of screens. It was this:',
    '但这个项目对我最大的意义，不是做出了多少页面，而是让我学会：'
  ),
  Q(
    'Product innovation does not mean waiting for the technology to be finished. It means finding the smallest path that holds today and still leads where you were going.',
    '产品创新并不意味着一定要等待最终技术成熟，而是找到一个今天能够成立、同时通向未来目标的最小可行路径。'
  ),
]

/* ---------------------------------------------------------------------- 智排 */

const ZHIPAI = [
  H('It started with a real problem', '从一个真实的问题开始'),
  P('智排 did not start with "I want to build a SaaS".', '智排并不是从「我想做一个 SaaS」开始的。'),
  P(
    'It started with watching a friend coordinate students, teachers, courses and classrooms at a tutoring centre — through Excel, Word and a great deal of talking to people.',
    '最初是因为我观察到朋友在管理教培机构工作时，需要长期通过 Excel、Word 和人工沟通协调学生、老师、课程和教室。'
  ),
  P(
    'On the surface it is "make a timetable". Once I actually tried it, it was a constraint optimisation problem:',
    '表面上只是「排一张课表」，但真正操作之后我发现，它其实是一个复杂的约束优化问题：'
  ),
  UL(
    ['When is the student free?', '学生什么时候有空？'],
    ['When is the teacher free?', '老师什么时候有空？'],
    ['Can that teacher take that subject?', '老师能不能教这个科目？'],
    ['Is there a room, and is it the right size?', '教室够不够？容量是否合适？'],
    ['Are the sessions back to back?', '有没有连堂？'],
    ['Someone was away — when is the make-up class?', '请假以后怎么补课？']
  ),
  P(
    'At any real size, moving one course can push the next dozen sessions out of place.',
    '一旦规模扩大，人工调整一个课程可能会影响后面十几节课。'
  ),

  H('Turning the offline process into a product', '把线下流程重新产品化'),
  P('First I broke the existing spreadsheet into objects:', '我先把原有 Excel 数据拆成结构化对象：'),
  SET(
    null,
    ['Student', 'Teacher', 'Class', 'Course', 'Classroom', 'Time slot'],
    ['Student', 'Teacher', 'Class', 'Course', 'Classroom', 'Time Slot']
  ),
  P('Then split the scheduling rules into two layers.', '再把排课规则划分为两层。'),
  UL(
    [
      '**Hard constraints — must hold.** Time clashes, room capacity, whether a teacher can take the subject, a teacher’s ceiling on hours.',
      '**Hard Constraints｜必须满足**：时间冲突、教室容量、教师学科能力、教师课时上限。',
    ],
    [
      '**Soft constraints — optimised once the hard ones hold.** Back-to-back sessions, keeping the same teacher and room, room utilisation, how efficiently the centre runs.',
      '**Soft Constraints｜尽量优化**：连续排课、固定老师和教室、场地利用率、机构运营效率。',
    ]
  ),
  P(
    'On top of those rules I designed the system around a course calendar control room, with students, teachers, courses, classrooms, absences and make-ups, session credits and operating figures around it.',
    '基于这些规则，我设计了以课程日历总控台为核心的管理系统，并加入学生、教师、课程、教室、请假补课、课消和运营数据等模块。'
  ),
  P('And kept both ways of using it:', '同时保留两种使用方式：'),
  SET(null, ['Automatic scheduling', 'Manual drag-and-drop'], ['自动排课', '手动拖拽调整']),
  P(
    'Because a real business is not served by a black-box "AI schedules it for you" button. Whoever runs the centre has to be able to understand the result, control it and change it.',
    '因为我发现，真实业务并不适合做一个完全黑盒的「AI 自动排课按钮」，管理者必须能够理解、控制和修改系统结果。'
  ),
  IMG(
    'zhipai-scheduling.png',
    'The 智排 scheduling workbench: the preferences a run is given — whose time to favour, which parts of the day to use, teaching rhythm and load, profit and room fit — with presets across the top, and a result saved as a draft or applied to the real timetable.',
    'What "not a black box" looks like on screen. A run is given preferences rather than a button — whose time to favour, which parts of the day to fill, how much back-to-back teaching a teacher can take, how full a room should be — and what comes back is a draft on the same timetable, kept as an option until somebody applies it.',
    '「不是黑盒」在界面上就是这个样子：排课不是一个按钮，而是一组可以勾选的偏好——优先照顾谁的时间、先填哪些时段、老师能连堂到什么程度、教室要坐得多满。生成的结果落在同一张草稿课表上，先当作备选留着，确认之后才写进真实课表。'
  ),

  H('Two doors, one timetable', '两个入口，同一张课表'),
  P(
    'The centre is not the only one who needs the schedule. A student wants to know when the next class is; a teacher has to say when they are free — and that availability is half of what the scheduler runs on. Collecting it message by message is how the spreadsheet went out of date in the first place.',
    '需要课表的不只是机构。学生想知道下一节课在什么时候；老师则必须报出自己什么时候有空——而这份可用时间正是排课算法一半的输入。靠微信一条条去问，正是当初那张 Excel 会过期的原因。'
  ),
  P(
    'So the product has two doors. The centre console is the whole timetable and everything behind it. The portal is where one person signs in, joins a centre with its code, and sees their own side of that same timetable and nothing else.',
    '所以产品做了两个入口。机构入口是整张课表以及它背后的一切；学生 / 教师入口则是个人登录的地方：用机构码加入一家机构，只看到同一张课表里属于自己的那一部分。'
  ),
  IMG(
    'zhipai-portal.png',
    'The 智排 portal: the centres this account has joined, each with its code and an Enter button, and a search box for applying to a new one.',
    'Getting in is a code and an approval, not an account somebody opens by hand. One person can hold more than one — the normal case for a teacher taking classes at two centres.',
    '进来靠的是一串机构码加一次审核，而不是管理员手动开号。一个人可以同时加入多家机构——这对同时在两家机构带课的老师本来就是常态。'
  ),
  P(
    'The teacher side asks for exactly what scheduling needs, and hands back what a teacher actually wants to see: available hours and subjects taught, leave and swap requests, post-class feedback, and the hours and fee this month comes to.',
    '老师端向老师要的，正好是排课需要的东西；给回去的，也正好是老师自己关心的：可用时间与可授科目、请假与调课、课后反馈，以及这个月已上、待上多少课时和大概多少课时费。'
  ),
  IMG(
    'zhipai-teacher.png',
    'The 智排 teacher home on a phone: the next class, a prompt to fill in available hours, seven actions, and this month’s hours taught, hours to come and fee.',
    'The line under the next class is the point of the whole screen. A teacher who has not filled in their available hours is a teacher the scheduler cannot place, so that is what it asks for before anything else.',
    '这一屏真正重要的是「下一节课」下面那句提醒。没有填可用时间的老师，系统根本没法给他排课——所以它先要的就是这个，其他都排在后面。'
  ),
  P(
    'The student side is the other end of the same thing: sign up, ask for leave, book a make-up, register the times that suit — and see the hours paid for, taken and left.',
    '学生端是同一件事的另一头：报名、请假、约补课、登记自己方便的时间，以及看到自己买了多少课时、上了多少、还剩多少。'
  ),
  IMG(
    'zhipai-student.png',
    'The 智排 student home on a phone: four actions, hours pending, taken and total, and today’s three classes with subject, teacher and room.',
    'Everything a family rings the front desk to ask — when is the class, who is teaching it, which room, how many hours are left — answered on one screen without anybody being asked.',
    '家长平时打电话到前台问的那些——今天几点上课、哪个老师、哪间教室、还剩几节——都在这一屏上，不用再问人。'
  ),
  IMG(
    'zhipai-student-schedule.png',
    'The 智排 student timetable: a week of classes with one day selected, and that day’s three sessions listed underneath with time, subject, teacher and room.',
    'And this is where the console’s work comes out. Whatever the scheduling run decided, one student sees it as a week and a day — the same timetable, cut down to the part that is theirs.',
    '总控台排出来的东西，最后就落在这里。不管排课那一步做了什么决定，学生看到的只是一周和一天——同一张课表，只留下与他有关的那部分。'
  ),

  H('The hardest part: what if there is no perfect answer?', '最大的问题：没有完美解怎么办？'),
  P(
    'The difficult thing about a scheduler is not finding a slot. It is that very often no arrangement satisfies everything at once.',
    '排课系统最困难的地方并不是「找到一个时间」，而是很多情况下根本不存在满足全部条件的答案。'
  ),
  P(
    'So I did not design the logic as a plain Success / Failed. When it cannot schedule, it has to go further and tell the manager:',
    '因此我没有把产品逻辑设计成简单的 Success / Failed。当系统无法完成排课时，它需要进一步告诉管理者：'
  ),
  Q(
    'Which constraint is the one blocking this — and which single change fixes it at the lowest cost.',
    '到底是哪一个约束导致无法排课，以及修改哪个条件能够以最小成本解决问题。'
  ),
  P(
    'Move one time slot, swap one room, free up one teacher’s hour — rather than sending someone back through the whole timetable by hand.',
    '例如调整一个时间段、更换一间教室或释放一个教师时段，而不是让管理人员重新人工检查整张课表。'
  ),
  P(
    'That was the first time I took a vague real-world problem and turned it into rules a product can compute, explain and be argued with.',
    '这让我第一次真正把一个模糊的现实问题，转化成了可以计算、可以解释、可以交互的产品规则。'
  ),

  H('Outcome', 'Outcome'),
  P(
    '智排 is in its validation stage, still being tested against real tutoring-centre situations: which needs come first, which scheduling rules hold, how the admin workflow should run.',
    '智排目前已经进入 Validation Stage，正在通过真实教培场景继续验证需求优先级、排课规则和管理端工作流。'
  ),
  P(
    'The system itself is deployed — a centre console, and the portal the students and teachers under it sign in to. What is still open is not whether it can be built. It is whether the problem hurts enough, where the old Excel workflow really wastes the time, and which of these features a centre keeps using once the novelty has worn off.',
    '系统本身已经部署上线：一个机构总控台，以及机构里的学生和老师登录的入口。还没确定的不是「能不能做出来」，而是这个问题是否足够痛、原来的 Excel 工作流到底是哪一步最浪费时间，以及新鲜感过去之后，机构还会继续用哪些功能。'
  ),
  Q(
    'Understand how the real world runs first. Then decide how the software should.',
    '先理解现实世界是怎么运行的，再决定软件应该怎么运行。'
  ),
]

/* ------------------------------------------------------------------ documents */

const PROJECTS = [
  {
    _id: 'project.exploremehere',
    /**
     * The one project that did not exist when the site was seeded, so the fields a
     * seeded document already had — its address, its place in the order — are written
     * here once, when the document is created, and never again: an edit made to them
     * in the studio afterwards stands.
     */
    create: {
      title: 'Exploremehere',
      slug: { _type: 'slug', current: 'exploremehere' },
      role: 'solo',
      featured: true,
      // First: the newest and the biggest of the four.
      order: 0,
      startDate: '2026-06-01',
    },
    status: 'live',
    category: S('Product · Founder · 2026', '产品 · 创始人 · 2026'),
    roleDetail: [
      S('Founder', '创始人'),
      S('Product Design', '产品设计'),
      S('Full-stack Development', '全栈开发'),
    ],
    tagline: S('AI résumé websites for jobs and study abroad', 'AI 简历网站 · 求职与留学'),
    summary: T(
      'An AI résumé-website builder for job seekers and study-abroad applicants. The AI asks about what a résumé only mentions in passing, then builds a bilingual personal website and a version for each job or programme — without making anything up. An agency edition lets consultancies work on it with their students. I designed and built it solo.',
      '面向求职和留学申请者的 AI 简历网站。AI 追问简历上一笔带过的经历，生成中英双语个人网站，并为每个岗位、每个项目生成定制版本，事实一律不编；另有面向就业和留学机构的机构版。从产品设计到全栈开发由我独立完成。'
    ),
    tags: [
      S('AI product', 'AI 产品'),
      S('Bilingual websites', '中英双语网站'),
      S('Tailored versions', '定制版本'),
      S('Agency edition', '机构版'),
    ],
    highlight: S('AI that never makes things up', 'AI 不编造事实'),
    features: [
      S(
        'A bilingual personal website from a résumé in Chinese, English or both',
        '从中文或英文简历（或两份）生成中英双语个人网站'
      ),
      S('Boost: read, ask, infer, rewrite — one line into a story', '开挂模式：读取、追问、推测、改写，把一句话挖成一段经历'),
      S('A tailored version for each job or programme, each at its own address', '为每个岗位、每个项目生成定制版本，各有独立网址'),
      S(
        'Facts locked: companies, titles, dates, schools and degrees never change',
        '事实锁定：公司、职位、时间、学校和学位不会被改'
      ),
      S(
        'Every AI-written line rule-checked and fact-checked against the user’s entries',
        '每段 AI 文字都过规则检查，并对照用户自己的经历核对'
      ),
      S(
        'An agency edition: seats, an adviser workspace and a 16-step study-abroad flow',
        '机构版：席位、顾问工作台和 16 步留学服务流程'
      ),
      S('Visit stats with no cookies and no tracking', '访问统计不用 cookie、不做追踪'),
    ],
    learnings: [
      S(
        'With AI in the product, the design work is deciding what it must never do. Trust is the feature.',
        '产品里有了 AI，设计的重点是规定它绝对不能做什么。信任本身就是功能。'
      ),
      S(
        'One person with AI coding agents can ship a multi-tenant platform. The bottleneck moves to deciding what to build.',
        '一个人加上 AI 编程助手，也能做出一个多租户平台；瓶颈变成了决定做什么。'
      ),
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Vercel', 'Claude API', 'Creem', 'Resend'],
    links: [LINK('live', 'Live site', '访问网站', 'https://exploremehere.com/')],
    cover: {
      file: 'exploremehere-home.png',
      alt: 'The Exploremehere home page: "Show interviewers why you’re the best fit", and beside it a tailored version of a sample site for a junior product designer role.',
    },
    nodes: EXPLOREMEHERE,
    related: ['project.dongqiuwang', 'project.zhipai'],
  },

  {
    _id: 'project.dongqiuwang',
    // The document is currently titled with its own slug — the name is 我是懂球王.
    title: '我是懂球王',
    status: 'live',
    category: S('Product · Self-initiated · 2026', '产品 · 自主发起 · 2026'),
    roleDetail: [
      S('Product Owner', '产品负责人'),
      S('Product Design', '产品设计'),
      S('AI-assisted Development', 'AI 辅助开发'),
    ],
    tagline: S('NBA daily predictions, settled by the system', 'NBA 每日预测 · 赛后自动结算'),
    summary: T(
      'A daily prediction platform for NBA fans. You call the game before tip-off, the system settles it the moment the game ends, and every call adds up — a score, a hit rate, a streak, a level, a place on the leaderboard. I took it from the first insight to a working product on my own.',
      '面向 NBA 球迷的每日预测平台。赛前站队，赛后自动结算，每一次判断都会累积成懂王分、命中率、连胜、等级和排行榜名次。从最初的洞察到可运行的产品，都由我独立完成。'
    ),
    tags: [
      S('Daily predictions', '每日预测'),
      S('Automatic settlement', '自动结算'),
      S('Points & leaderboard', '积分与排行榜'),
      S('AI-assisted build', 'AI 辅助开发'),
    ],
    highlight: S('Runs without an admin', '无需人工运营'),
    features: [
      S('Fixtures sync per game day, and each one opens its own room', '按比赛日同步赛程，自动生成比赛房间'),
      S('Picks and score calls before tip-off, locked once the game starts', '赛前站队与比分预测，开赛即封盘'),
      S('Settlement fires when the game ends — no administrator involved', '比赛结束自动结算，无需管理员介入'),
      S('Score, hit rate, streak and level, accumulating per user', '懂王分、命中率、连胜与等级持续累积'),
      S('A leaderboard people come back for', '让人愿意回来的排行榜'),
      S(
        'An admin panel for the exceptions: monitoring, corrections, re-settlement',
        '后台负责异常监控、数据修正与重新结算'
      ),
    ],
    learnings: [
      S(
        'Unstable third-party data is the normal case, not the emergency. Naming each failure as its own state beats fixing games by hand.',
        '外部数据不稳定是常态而不是意外：把每种失败拆成独立状态和兜底逻辑，比人工逐场补救可靠。'
      ),
      S(
        'Cutting the news feed, the chat rooms and the live streaming is what made the loop finishable at all.',
        '砍掉资讯流、聊天室和直播，这条闭环才真的做得完。'
      ),
      S(
        'A CS background was not the blocker: breaking the product down, working with AI and iterating quickly took an idea all the way to a live product.',
        '没有传统 CS 背景同样可以：靠产品拆解、AI 协作和快速迭代，把一个想法做成了上线运营的产品。'
      ),
    ],
    stack: ['PostgreSQL', 'Prisma', 'BallDontLie API', 'Vercel', 'Cron jobs', 'Claude', 'Codex'],
    links: [LINK('live', 'Live site', '访问网站', 'https://woshidongqiuwang.com/')],
    cover: {
      file: 'dongqiuwang-home.png',
      alt: 'The 我是懂球王 home screen: the day rail across the top, the fixtures for that day, and the 懂王 news feed under them.',
    },
    nodes: DONGQIUWANG,
    related: ['project.just-hoop', 'project.zhipai'],
  },

  {
    _id: 'project.just-hoop',
    status: 'building',
    category: S('Venture · Self-initiated', '创业项目 · 自主发起'),
    roleDetail: [
      S('Founder', '创始人'),
      S('Product Owner', '产品负责人'),
      S('Product Strategy', '产品策略'),
    ],
    tagline: S('Pick-up basketball, refereed remotely', '野球场上的标准化比赛 · 远程执裁'),
    summary: T(
      'Turning pick-up basketball into a game that counts: easy to join, matched by level, actually officiated, recorded when it ends. A remote human referee calls it over video today — the long-term target is an AI referee, and the architecture is built for it to take over.',
      '把普通野球升级成一种真正算数的比赛：容易加入、水平匹配、公平判罚、结果可记录。现阶段由远程真人裁判通过视频执裁，长期目标是 AI 裁判，产品架构从一开始就为此预留了升级空间。'
    ),
    tags: [
      S('Three-sided product', '三端产品'),
      S('Elo rating', 'Elo 评分'),
      S('Human-in-the-loop', 'Human-in-the-Loop'),
      S('Remote officiating', '远程执裁'),
    ],
    features: [
      S('Sign-up and matchmaking by level', '按水平匹配的报名与组局'),
      S(
        'A remote referee running the clock, score, fouls and possession over video',
        '远程裁判通过视频完成计时、计分、犯规与球权'
      ),
      S('Result submission and a route for appeals', '赛果提交与申诉流程'),
      S(
        'Elo, calculated independently per mode — 1v1, 3v3, king of the court',
        'Elo 评分：1V1、3V3、多人擂台分别独立计算'
      ),
      S('Referee vetting, rostering and a credit system on the admin side', 'Admin 端的裁判审核、排班与信用体系'),
    ],
    learnings: [
      S(
        'Technical ideal → feasibility call → MVP rebuild → product roadmap. I went through that sequence rather than reading about it.',
        '技术理想 → 可行性判断 → MVP 重构 → 产品路线设计，这一整条路我是真的走了一遍。'
      ),
      S(
        'A human in the loop is not a compromise. It is how you validate the problem while the technology catches up.',
        'Human-in-the-Loop 不是妥协，而是在技术成熟之前先把问题验证掉的办法。'
      ),
    ],
    // No link on purpose: there is nothing public to open yet. The detail page says
    // so where the buttons would be, rather than pointing at a holding page.
    cover: {
      file: 'just-hoop-lobby.png',
      alt: 'The Just Hoop lobby: tonight’s venue, ranked or casual, the conditions for a game, and the friends already playing.',
    },
    nodes: JUST_HOOP,
    related: ['project.dongqiuwang', 'project.zhipai'],
  },

  {
    _id: 'project.zhipai',
    status: 'validating',
    category: S('Built for a real user', '为一个真实用户而做'),
    roleDetail: [
      S('Product Owner', '产品负责人'),
      S('User Research', '用户研究'),
      S('Product Design', '产品设计'),
    ],
    tagline: S('Class scheduling for tutoring centres', '教培机构排课与管理系统'),
    summary: T(
      'A scheduling and admin system for tutoring centres. It began as a friend’s Excel workbook and turned out to be a constraint problem: students, teachers, subjects, rooms and time slots that all have to hold at once. It runs as a console for the centre plus a portal the students and teachers sign in to, and is being validated against a real one.',
      '面向教培机构的排课与管理系统。起点是朋友手里的一份 Excel，拆开之后才发现它其实是一个约束优化问题：学生、老师、科目、教室和时间必须同时成立。现在由一个机构总控台加上学生与老师登录的入口组成，正在一家真实机构里验证。'
    ),
    tags: [
      S('Constraint modelling', '约束建模'),
      S('Calendar control room', '课程日历总控台'),
      S('User research', '用户研究'),
    ],
    highlight: S('Validating with a real centre', '在真实机构中验证'),
    features: [
      S('A course calendar control room — the whole schedule on one screen', '课程日历总控台：一屏看到全部排课'),
      S('Automatic scheduling, with manual drag-and-drop over the top', '自动排课，叠加手动拖拽调整'),
      S('Students, teachers, courses and classrooms as records', '学生、教师、课程与教室档案'),
      S('Absences, make-up classes and session credits', '请假、补课与课消管理'),
      S('When it cannot schedule, it names the constraint that blocked it', '排不出来时，指出是哪一条约束卡住了'),
      S(
        'A portal for students and teachers, joined with the centre’s code',
        '学生与老师的独立入口，用机构码加入'
      ),
      S(
        'Available hours and subjects, entered by the teachers themselves',
        '可用时间与可授科目，由老师自己填'
      ),
    ],
    learnings: [
      S(
        'Understand how the real world runs before deciding how the software should.',
        '先理解现实世界是怎么运行的，再决定软件应该怎么运行。'
      ),
      S(
        'A black-box "AI does it for you" button does not fit a real business — the manager has to be able to understand and overrule the result.',
        '完全黑盒的「AI 一键排课」不适合真实业务：管理者必须能理解并推翻系统给出的结果。'
      ),
      S(
        'Telling a user which single change costs least is worth far more than returning "no solution".',
        '告诉用户「改哪个条件成本最低」，远比只返回一个「排不出来」有用。'
      ),
    ],
    links: [
      LINK('live', 'Student & teacher portal', '学生 · 老师入口', 'https://zhipai.vercel.app/portal'),
      LINK('live', 'Centre console', '机构入口', 'https://zhipai.vercel.app/admin/login'),
    ],
    cover: {
      file: 'zhipai-console.png',
      alt: 'The 智排 home console: today’s classes, conflicts, expected revenue and room and teacher utilisation across the top, a week of the timetable under them, and the queue of things waiting to be dealt with down the right.',
    },
    nodes: ZHIPAI,
    related: ['project.dongqiuwang', 'project.just-hoop'],
  },
]

/* --------------------------------------------------------------------- accounts */

/**
 * The two accounts in the "Also running" strip.
 *
 * They are not case studies and do not want a page of their own — what there is to
 * say about them is where to find them. A 抖音号 is an ID rather than an address:
 * there is no web URL that reliably opens an account from one, so it is written as a
 * handle to search for in the app and rendered as text, not as a link that would not
 * open.
 */
const ACCOUNTS = [
  {
    _id: 'project.dongwang-brothers',
    summary: T(
      'A basketball commentary account, and where the opinions go before they turn into products.',
      '一个篮球评论账号。观点先在这里出现，然后才变成产品。'
    ),
    handles: [{ _type: 'projectHandle', platform: 'douyin', id: '94617971040' }],
  },
  {
    _id: 'project.life-channel',
    summary: T(
      'My own account, on studying, building things and living abroad.',
      '我自己的账号，关于读书、做东西和在国外生活。'
    ),
    handles: [{ _type: 'projectHandle', platform: 'douyin', id: '75824206077' }],
  },
]

/**
 * Every screenshot the projects above name, with what it is for.
 *
 * The list is derived rather than kept by hand: a cover added to a project or an
 * `IMG` dropped into a write-up is a file to upload from that moment, with no second
 * place to remember to add it.
 */
function mediaFiles(projects = PROJECTS) {
  const files = []
  for (const project of projects) {
    if (project.cover) {
      files.push({ file: project.cover.file, alt: project.cover.alt, project: project._id, role: 'cover' })
    }
    for (const node of project.nodes) {
      if (node.kind === 'image') {
        files.push({ file: node.file, alt: node.alt, project: project._id, role: 'body' })
      }
    }
  }
  return files
}

export { PROJECTS, ACCOUNTS, writeUp, keyed, refs, mediaFiles }
