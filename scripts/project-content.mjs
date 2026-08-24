/**
 * The case studies themselves — three projects, both languages, no transport.
 *
 * Kept apart from the script that writes them so the same words can be rendered
 * somewhere else without a Sanity token: `project-detail.mjs` patches them into the
 * dataset, `preview-detail.mjs` turns them into a page you can look at first.
 *
 * The write-up is authored once as bilingual pairs and split into `body` (English)
 * and `bodyZh` at the end, which is what keeps the two languages structurally
 * identical — same sections, same chains, same order.
 */

/* ------------------------------------------------------------------ authoring */

const S = (en, zh) => ({ _type: 'localeString', en, zh })
const T = (en, zh) => ({ _type: 'localeText', en, zh })

/** The write-up, written once as bilingual pairs and split into two at the end. */
const H = (en, zh) => ({ kind: 'block', style: 'h3', en, zh })
const P = (en, zh) => ({ kind: 'block', style: 'normal', en, zh })
const Q = (en, zh) => ({ kind: 'block', style: 'blockquote', en, zh })
/** Bulleted list. Each item is an [en, zh] pair; `**text**` inside one goes bold. */
const UL = (...items) => ({ kind: 'list', items })
const CHAIN = (label, en, zh) => ({ kind: 'flow', variant: 'chain', label, en, zh })
const SET = (label, en, zh) => ({ kind: 'flow', variant: 'set', label, en, zh })

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

/** Turns the bilingual outline into one language's Portable Text array. */
function writeUp(nodes, lang) {
  const out = []
  nodes.forEach((node, i) => {
    const key = `b${i}`
    if (node.kind === 'block') {
      out.push(block(key, node.style, node[lang]))
    } else if (node.kind === 'list') {
      node.items.forEach((item, j) => {
        out.push(block(`${key}i${j}`, 'normal', lang === 'zh' ? item[1] : item[0], 'bullet'))
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
    'The core loop is finished, and the product is in its last round of testing before launch.',
    '目前核心产品闭环已经完成，正在进行上线前的最终测试。'
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
    'It started with watching a family member coordinate students, teachers, courses and classrooms at a tutoring centre — through Excel, Word and a great deal of talking to people.',
    '最初是因为我观察到家人在教培机构工作时，需要长期通过 Excel、Word 和人工沟通协调学生、老师、课程和教室。'
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
    'Rather than going straight into building it, I wanted three things confirmed first: whether the problem hurts enough, where the existing Excel workflow wastes the most time, and which features people would genuinely use.',
    '相比直接进入开发，我选择先确认：这个问题是否足够痛、现有 Excel 工作流哪里最浪费时间、哪些功能用户真正愿意使用。'
  ),
  Q(
    'Understand how the real world runs first. Then decide how the software should.',
    '先理解现实世界是怎么运行的，再决定软件应该怎么运行。'
  ),
]

/* ------------------------------------------------------------------ documents */

const PROJECTS = [
  {
    _id: 'project.dongqiuwang',
    // The document is currently titled with its own slug — the name is 我是懂球王.
    title: '我是懂球王',
    status: 'comingSoon',
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
        'A CS background was not the blocker: breaking the product down, working with AI and iterating quickly got an idea to the point of launch.',
        '没有传统 CS 背景同样可以：靠产品拆解、AI 协作和快速迭代，把一个想法推进到可上线状态。'
      ),
    ],
    stack: ['PostgreSQL', 'Prisma', 'BallDontLie API', 'Vercel', 'Cron jobs', 'Claude', 'Codex'],
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
      'A scheduling and admin system for tutoring centres. It began as a family member’s Excel workbook and turned out to be a constraint problem: students, teachers, subjects, rooms and time slots that all have to hold at once. It is in validation with a real centre rather than in build, on purpose.',
      '面向教培机构的排课与管理系统。起点是家人手里的一份 Excel，拆开之后才发现它其实是一个约束优化问题：学生、老师、科目、教室和时间必须同时成立。目前刻意停在验证阶段，用真实场景继续确认需求，而不是先进入开发。'
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
    nodes: ZHIPAI,
    related: ['project.dongqiuwang', 'project.just-hoop'],
  },
]

export { PROJECTS, writeUp, keyed, refs }
