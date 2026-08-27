/**
 * Writes the CV detail onto the five role documents.
 *
 * The cards on /experience are deliberately short — company, role, dates, one
 * paragraph — so everything longer lives on the role's own page instead. This is
 * that content: for each role, the job title as the CV writes it, and four
 * contributions, each with its lead-in, its detail, and the one or two skills that
 * piece of work actually took — and, where there is one, the photograph of that
 * piece of work. The pictures are named in `photo-content.mjs` and uploaded by
 * `npm run media`; they are attached here rather than in a script of their own
 * because this one owns the whole contributions list, and anything written into it
 * from somewhere else would be replaced the next time this runs.
 *
 * Run it with an Editor token:
 *   SANITY_API_WRITE_TOKEN=... npm run experience-detail
 *   npm run experience-detail -- --dry-run    # print, change nothing
 *
 * The token can also live in .env.local as SANITY_API_WRITE_TOKEN, or come from
 * `npx sanity login` — see sanity-write.mjs, which is where every script here gets
 * the same answer to what counts as a credential.
 *
 * It sets `role` and `contributions` on the published documents and leaves every
 * other field alone — dates included, which stay as the dataset has them. Re-running
 * is safe: keys are derived from position, so a second run replaces rather than
 * duplicates. If a document has unpublished edits open in the studio, that draft
 * wins on screen until it is published — publish it first, or this looks like it did
 * nothing.
 */
import { writeClient } from './sanity-write.mjs'
import { PHOTOS, EXPERIENCE_PHOTOS } from './photo-content.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const client = writeClient('npm run experience-detail', { needsWrite: !DRY_RUN })

/**
 * Job titles as the CV writes them, replacing the ones the prototype carried.
 * Dates are not touched: where the two disagreed, the dataset held the longer period,
 * and that is the one to keep.
 */
const ROLES = [
  {
    _id: 'experience.orfeostory',
    role: { en: 'Digital Project Executive Intern', zh: '数字项目执行实习生' },
    contributions: [
      {
        title: {
          en: 'Website project management and requirement translation',
          zh: '企业网站项目管理与需求转化',
        },
        body: {
          en: 'Several website projects at once — SATA CommHealth, Infinity Financial Advisory and Causes for Animals Singapore among them — pulling the business goal out of client meetings, requirement interviews and feedback documents, and turning loosely worded requests into a workable Website Proposal, sitemap, page structure, functional scope, project plan and revision list. On SATA CommHealth that meant rebuilding the information architecture around medical services, community services, appointments, complaints and the newsletter, and drawing a clearer path through the site for each user persona.',
          zh: '同时参与 SATA CommHealth、Infinity Financial Advisory、Causes for Animals Singapore 等多个网站项目，从客户会议、需求访谈和反馈文件中梳理业务目标，并将较为模糊的客户需求转化为可执行的 Website Proposal、Sitemap、Page Structure、Functional Scope、Project Plan 和 Revision List。例如在 SATA CommHealth 项目中，根据医疗服务、社区服务、预约、投诉及 Newsletter 等需求重新整理网站信息架构，并针对不同用户 Persona 设计更清晰的访问路径。',
        },
        skills: [
          { en: 'Requirement translation', zh: '需求转化' },
          { en: 'Information architecture', zh: '信息架构' },
        ],
      },
      {
        title: { en: 'Keeping three sides pointed the same way', zh: '跨团队项目推进' },
        body: {
          en: 'I sat between the client, the designers and the developers — breaking feedback into specific page and feature changes with a priority, an owner and a delivery date, and following each one through conceptual design, HTML development, alpha review, beta review, UAT and go-live. Where the build drifted from the design, I checked copy, images, banners, CTAs, footers, mobile responsiveness, page transitions and interaction logic item by item, so less was missed and less was done twice.',
          zh: '作为客户、Designer 与 Developer 之间的协调角色，将客户反馈拆解为具体页面和功能修改项，明确优先级、负责人及交付时间，并持续跟进 Conceptual Design、HTML Development、Alpha Review、Beta Review、UAT 与 Go-live 等阶段；针对设计稿与最终开发效果不一致的问题，逐项核对文字、图片、Banner、CTA、Footer、Mobile Responsive、页面跳转及交互逻辑，减少信息遗漏和重复返工。',
        },
        skills: [
          { en: 'Project management', zh: '项目管理' },
          { en: 'Cross-team coordination', zh: '跨团队协调' },
        ],
      },
      {
        title: { en: 'Features and back-office logic', zh: '网站功能与后台逻辑梳理' },
        body: {
          en: 'Worked through adoption, foster, volunteer, donation, payment gateway, campaign, event, login access and API integration with the development team, confirming how front- and back-office data relate and how a user actually moves through each flow. When the client’s API was not ready, I helped plan two launch paths — sample data and live API data — so an external dependency could not hold the whole build.',
          zh: '针对 Adoption、Foster、Volunteer、Donation、Payment Gateway、Campaign、Event、Login Access、API Integration 等功能，与开发团队确认前后台数据关系和用户操作流程；在客户 API 尚未准备完成时，协助制定 Sample Data / API Data 两套上线方案，保证网站开发进度不被外部依赖完全阻塞。',
        },
        skills: [
          { en: 'Functional scoping', zh: '功能梳理' },
          { en: 'Working with developers', zh: '与开发协作' },
        ],
      },
      {
        title: { en: 'WhatsApp AI research and product design', zh: 'WhatsApp AI 产品调研与产品设计' },
        body: {
          en: 'Researched the market and the competition for an enterprise WhatsApp automation need — what ChatAvocado, Meta’s WhatsApp AI and others can and cannot do — then broke the real business requirement into a full user flow: an automatic reminder 12 hours before a meeting, attendance confirmation, rescheduling and cancellation, a Google Calendar free-slot lookup, automatic Google Meet creation, handover between the AI and a human agent, and a conversation dashboard with search. It gave the team a product position and an order to build in.',
          zh: '针对企业客户的 WhatsApp 自动化需求完成市场与竞品研究，分析 ChatAvocado、Meta WhatsApp AI 等产品的能力和限制，并将真实业务需求拆解为完整 User Flow，包括会议前 12 小时自动提醒、用户确认出席、预约改期/取消、Google Calendar 空闲时间查询、Google Meet 自动创建、AI 与人工客服切换、Conversation Dashboard 与搜索管理等模块，辅助团队明确产品定位及后续开发优先级。',
        },
        skills: [
          { en: 'Competitor research', zh: '竞品研究' },
          { en: 'User flow design', zh: 'User flow 设计' },
        ],
      },
    ],
  },
  {
    _id: 'experience.stranger-soccer',
    role: { en: 'Customer Experience & Growth Intern', zh: '客户体验与增长实习生' },
    contributions: [
      {
        title: { en: 'Match-day operations and customer experience', zh: '线下比赛运营与客户服务' },
        body: {
          en: 'Ran the day-to-day games in Singapore: player check-in, balancing the teams, explaining the rules, keeping order on the pitch, covering late drop-outs and short sides, and collecting feedback after the whistle. The platform has around 40,000 players here; I handled the games and the customer experience for roughly a third of them, which means solving problems between players of different nationalities and very different levels while the game is happening.',
          zh: '参与 Stranger Soccer 新加坡市场的日常足球比赛运营，负责玩家签到、球队分组、比赛规则说明、现场秩序管理、临时缺席或人数不足处理，以及赛后用户反馈收集；平台在新加坡拥有约 40,000 名玩家，本人负责约 1/3 用户相关的比赛和客户体验运营工作，需要在比赛现场快速处理不同国籍、不同水平玩家之间的体验问题。',
        },
        skills: [
          { en: 'Live operations', zh: '线下运营' },
          { en: 'Customer experience', zh: '客户体验' },
        ],
      },
      {
        title: {
          en: 'Complaint analysis and a standard way to handle it',
          zh: '用户投诉分析与服务流程优化',
        },
        body: {
          en: 'Put what I heard on the pitch next to the complaint data in the Stranger Soccer app and sorted it into recurring themes — skill level matching, match intensity, the gap between players, host quality, the experience overall. Naming the frequent cases, agreeing one way to handle each, and reworking how hosts talk to players turned something that had depended on individual judgement into a process anyone could follow, and complaints of this kind fell from around 10% to 1–2%.',
          zh: '结合现场反馈和 Stranger Soccer App 后台投诉数据，系统整理用户对 Skill Level Matching、比赛强度、玩家水平差异、Host 服务质量和比赛体验等问题的反馈；通过总结高频投诉场景、建立统一处理标准并优化 Host 与玩家沟通方式，将原本较为依赖个人经验的处理方式转化为更标准化的运营流程，相关投诉比例由约 10% 降低至 1–2%。',
        },
        skills: [
          { en: 'Feedback analysis', zh: '反馈数据分析' },
          { en: 'Process standardisation', zh: '流程标准化' },
        ],
      },
      {
        title: { en: 'Making the rules legible', zh: '规则与产品信息标准化' },
        body: {
          en: 'Players were reading the game tiers differently from how they were meant, so I helped redefine what each tier is, who it suits and what it asks of a player, then pushed that same wording through the documents, the on-site briefing and the content — which cut the complaints that came from a game not matching what the player expected.',
          zh: '发现平台对不同比赛等级及玩家水平的说明存在理解偏差后，协助重新梳理不同 Game Tier 的定义、适合人群及比赛要求，并通过文档、现场说明及内容材料统一用户认知，降低玩家因“实际比赛水平与预期不一致”产生的投诉。',
        },
        skills: [{ en: 'Product information design', zh: '产品信息设计' }],
      },
      {
        title: { en: 'Growth and content', zh: '增长与内容运营' },
        body: {
          en: 'Worked on social content and on-the-ground promotion — short-form video, match footage, player interaction, offers — to keep the community active, and carried real player feedback back to the operations team as first-hand input into the game product, how players are spoken to, and how the community grows.',
          zh: '参与社交媒体内容及线下活动推广，通过短视频、比赛素材、玩家互动内容及优惠信息提升社区活跃度；同时将真实玩家反馈同步给运营团队，为后续比赛产品、用户沟通方式及社区增长策略提供一线用户洞察。',
        },
        skills: [
          { en: 'Content operations', zh: '内容运营' },
          { en: 'Community growth', zh: '社区增长' },
        ],
      },
    ],
  },
  {
    _id: 'experience.ernst-young',
    role: { en: 'Financial Service Intern', zh: '金融服务实习生' },
    contributions: [
      {
        title: { en: 'Mapping the shared-service processes', zh: '财务共享流程梳理' },
        body: {
          en: 'On a financial shared service / finance transformation engagement, I read client interview material, existing SOPs and process documents to establish what each finance role is responsible for, the steps it takes and where work changes hands — then broke complex flows into standard processes, sub-processes and individual operating steps.',
          zh: '参与企业 Financial Shared Service / Finance Transformation 项目，通过客户访谈资料、已有 SOP 和业务流程文件梳理企业不同财务岗位的职责、操作步骤及交接关系，并将复杂的业务流程拆解为标准化的 Process、Sub-process 和具体操作节点。',
        },
        skills: [
          { en: 'Process mapping', zh: '业务流程梳理' },
          { en: 'Requirement gathering', zh: '需求调研' },
        ],
      },
      {
        title: { en: 'Writing the desktop procedures', zh: 'DTP 标准化文档编制' },
        body: {
          en: 'Produced 20+ desktop procedures (DTPs) from the actual finance operations, each recording the purpose, the inputs, the system steps, the owner, the approval points and the output — turning knowledge that lived in people’s heads into documents that could be reused for training, handover and shared-centre standardisation.',
          zh: '根据实际财务操作流程完成 20+ Desktop Procedures (DTPs)，详细记录每项业务的操作目的、输入材料、系统操作步骤、责任人、审批节点及输出结果，将原本依赖员工经验的操作流程沉淀为可复用文档，用于后续人员培训、流程交接和共享中心标准化管理。',
        },
        skills: [
          { en: 'SOP writing', zh: 'SOP 文档撰写' },
          { en: 'Standardisation', zh: '标准化' },
        ],
      },
      {
        title: { en: 'Drawing the process', zh: '业务流程可视化' },
        body: {
          en: 'Drew 20+ end-to-end process flowcharts in Microsoft Visio, using swimlanes to show how tasks move between departments and roles, where the approvals sit and where information passes — so the client and the team could see the duplicated steps, the unclear ownership and the room to simplify.',
          zh: '使用 Microsoft Visio 绘制 20+ End-to-End Process Flowcharts，通过 Swimlane 等方式展示不同部门和岗位之间的任务流转、审批关系及信息传递节点，使客户和项目团队能够更直观地识别流程中的重复操作、职责边界及潜在优化空间。',
        },
        skills: [
          { en: 'Process visualisation', zh: '流程可视化' },
          { en: 'Visio', zh: 'Visio' },
        ],
      },
      {
        title: { en: 'Delivery support', zh: '项目交付支持' },
        body: {
          en: 'Revised the DTPs and the flowcharts against manager and client feedback, kept format, process naming and step descriptions consistent across modules, and helped assemble the final client deliverables.',
          zh: '持续根据项目经理和客户反馈修改 DTP 与流程图，统一文档格式、流程命名和关键节点描述，保证不同业务模块之间的文档标准一致，并协助团队完成最终客户交付材料整理。',
        },
        skills: [{ en: 'Deliverable management', zh: '交付管理' }],
      },
    ],
  },
  {
    _id: 'experience.suoao',
    role: { en: 'Marketing / Product Operations Intern', zh: '市场与产品运营实习生' },
    contributions: [
      {
        title: { en: 'Template review and quality control', zh: '内容模板审核与质量控制' },
        body: {
          en: 'Created, reviewed and quality-checked 5,000+ templates for the company’s web template product — judging page structure, visual finish, whether the copy is complete, asset quality, the case it is meant for and what it is like to use — and logged the recurring problems back to the design and operations teams.',
          zh: '参与公司互联网模板产品运营，累计完成 5,000+ 模板的创建、审核和质量检查，从页面结构、视觉效果、文字完整性、素材质量、适用场景和用户使用体验等维度判断模板是否符合上线标准，并记录高频问题反馈给设计及运营团队。',
        },
        skills: [
          { en: 'Quality control', zh: '质量控制' },
          { en: 'Content review', zh: '内容审核' },
        ],
      },
      {
        title: { en: 'Organising pages at scale', zh: '大规模页面数据整理' },
        body: {
          en: 'Went through 20,000+ sites and pages on the platform, classifying them by industry, use case, page type and visual style so a library that size could actually be managed — and, from a user’s side, looking at how different page designs affect what people choose and how quickly they get there.',
          zh: '对平台 20,000+ 网站/页面进行系统化浏览、分类与信息整理，根据行业、使用场景、页面类型、视觉风格等维度建立分类逻辑，帮助团队更高效地管理大量模板资产，同时从用户视角分析不同页面设计对用户选择和使用效率的影响。',
        },
        skills: [
          { en: 'Information classification', zh: '信息分类' },
          { en: 'User-side analysis', zh: '用户视角分析' },
        ],
      },
      {
        title: { en: 'Rewriting the review SOP', zh: '审核流程 SOP 优化' },
        body: {
          en: 'The existing review had inconsistent standards, duplicated checks and too much back-and-forth, so I re-cut the steps: what must be checked, how a problem is categorised, what counts as a required fix and what passes — plus a checklist of the common errors, so someone new could run a review by following the process rather than by knowing the product.',
          zh: '发现原有模板审核流程存在审核标准不统一、重复检查以及沟通成本较高等问题后，重新拆分审核步骤，明确必查项、问题分类、修改标准和通过条件，并将常见错误整理为统一审核 Checklist，使新人也能按照固定流程完成审核。',
        },
        skills: [
          { en: 'SOP design', zh: 'SOP 设计' },
          { en: 'Process improvement', zh: '流程优化' },
        ],
      },
      {
        title: { en: 'Two days down to two hours', zh: '显著提升工作效率' },
        body: {
          en: 'Standardising the rules and the flow brought one review round from roughly two days to about two hours, and took most of the disagreement between reviewers out of it. It is where I started thinking in terms of SOPs, standard process and AI/automation for work that repeats.',
          zh: '通过审核规则标准化及流程优化，将原本约需要 2 天完成的一轮审核缩短至约 2 小时，同时减少不同审核人员之间判断标准不一致的问题；该经历使我开始形成通过 SOP、标准化流程和 AI/自动化工具提升重复性工作效率的工作思路。',
        },
        skills: [{ en: 'Efficiency optimisation', zh: '效率优化' }],
      },
    ],
  },
  {
    _id: 'experience.zhifeng',
    role: { en: 'Marketing Intern', zh: '市场营销实习生' },
    contributions: [
      {
        title: { en: 'Content for an international tournament', zh: '大型体育赛事内容运营' },
        body: {
          en: 'Marketing and media for an international badminton tournament — the build-up, player introductions, match information and promotional posts on WeChat and Weibo, from picking the angle and gathering the material through writing the copy and following the post out. 10+ pieces, 10,000+ reads.',
          zh: '参与国际羽毛球赛事的市场营销和媒体传播工作，负责微信公众号、微博等平台的赛事预热、球员介绍、比赛信息及活动推广内容，从选题、资料整理、文案撰写到发布跟进均参与执行，累计完成 10+ 篇内容，获得 10,000+ 阅读/浏览量。',
        },
        skills: [
          { en: 'Content planning', zh: '内容策划' },
          { en: 'Social media', zh: '新媒体运营' },
        ],
      },
      {
        title: { en: 'Running a social campaign', zh: '社交媒体活动策划' },
        body: {
          en: 'Took a Weibo interaction campaign end to end — theme, entry rules, promotional copy, posting schedule and the interaction mechanic — and tracked reach and participation while it ran. It drew 6,000+ participants and widened the conversation around the tournament.',
          zh: '参与微博线上互动营销活动的完整执行，包括活动主题设计、参与规则、推广文案、发布时间及用户互动机制，并持续跟踪活动传播数据和用户参与情况，最终吸引 6,000+ 用户参与，帮助赛事扩大线上曝光及球迷讨论度。',
        },
        skills: [
          { en: 'Campaign planning', zh: '活动策划' },
          { en: 'Performance tracking', zh: '数据跟踪' },
        ],
      },
      {
        title: { en: 'Brand and government stakeholders', zh: '品牌与政府 Stakeholder 协调' },
        body: {
          en: 'Helped liaise with the Changzhou Sports Bureau, YONEX, the athletes and partner organisations through preparation and delivery: collecting each side’s requirements for materials, brand visibility, tournament content and how the event runs, then keeping the internal team aligned so what went out satisfied all of them.',
          zh: '在赛事筹备和执行期间协助对接常州市体育局、YONEX、运动员及相关合作方，整理不同合作方对于宣传物料、品牌露出、赛事内容和活动执行的具体要求，并在内部团队之间同步信息，保证市场传播内容符合各方需求。',
        },
        skills: [{ en: 'Stakeholder management', zh: '多方协调' }],
      },
      {
        title: { en: 'Working with a top athlete’s team', zh: '顶级运动员合作支持' },
        body: {
          en: 'Supported the communication and promotion around badminton player Viktor Axelsen’s team — the materials, the content schedule, what they needed — which is where I learned what it takes to keep a government body, a brand, an organiser and an athlete’s team moving together.',
          zh: '参与与国际羽毛球运动员 Viktor Axelsen 团队相关的沟通及市场推广执行，协助处理运动员相关宣传素材、内容安排和合作需求，由此积累大型体育赛事中政府、品牌、赛事方和运动员团队多方协同的实际经验。',
        },
        skills: [{ en: 'Brand partnerships', zh: '品牌合作' }],
      },
    ],
  },
]

const localeString = (value) => ({ _type: 'localeString', en: value.en, zh: value.zh })
const localeText = (value) => ({ _type: 'localeText', en: value.en, zh: value.zh })

/**
 * The photographs, looked up by filename rather than held as asset ids.
 *
 * Same arrangement as the project screenshots: the file is the thing that is chosen
 * and replaced, and the id is whatever the dataset gave it. A picture that has not
 * been uploaded yet is left out — the contribution reads perfectly well without one.
 */
const assets = new Map(
  (
    await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename in $files]
        | order(_createdAt asc)
        { _id, originalFilename }`,
      { files: EXPERIENCE_PHOTOS.map((p) => p.file) }
    )
  ).map((asset) => [asset.originalFilename, asset._id])
)

/** The picture for one contribution, by the position it sits at on that role. */
function pictureFor(roleId, index) {
  const spot = EXPERIENCE_PHOTOS.find((p) => p._id === roleId && p.contribution === index)
  if (!spot) return null
  const asset = assets.get(spot.file)
  if (!asset) {
    console.warn(`  ⚠ ${spot.file} is not uploaded yet — run \`npm run media\`.`)
    return null
  }
  const photo = PHOTOS[spot.file]
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset },
    ...(photo.alt ? { alt: photo.alt } : {}),
    ...(photo.hotspot ? { hotspot: { _type: 'sanity.imageHotspot', ...photo.hotspot } } : {}),
  }
}

/** Keys are derived from position, so re-running replaces rather than duplicates. */
const contributions = (role) =>
  role.contributions.map((contribution, i) => {
    const picture = pictureFor(role._id, i)
    return {
      _type: 'contribution',
      _key: `c${i}`,
      title: localeString(contribution.title),
      body: localeText(contribution.body),
      skills: contribution.skills.map((skill, j) => ({
        ...localeString(skill),
        _key: `c${i}s${j}`,
      })),
      ...(picture ? { image: picture } : {}),
    }
  })

const existing = await client.fetch('*[_id in $ids]{_id}', { ids: ROLES.map((r) => r._id) })
const found = new Set(existing.map((d) => d._id))

for (const role of ROLES) {
  if (!found.has(role._id)) {
    console.warn(`⚠ ${role._id} is not in the ${client.config().dataset} dataset — skipped.`)
    continue
  }

  const written = contributions(role)
  const skillCount = role.contributions.reduce((n, c) => n + c.skills.length, 0)
  const pictures = written.filter((c) => c.image).length
  const summary =
    `${role.contributions.length} contributions, ${skillCount} skills, en + zh` +
    (pictures > 0 ? `, ${pictures} picture${pictures > 1 ? 's' : ''}` : '')

  if (DRY_RUN) {
    console.log(`· ${role._id}: ${summary} (dry run)`)
    continue
  }

  await client
    .patch(role._id)
    .set({ role: localeString(role.role), contributions: written })
    .commit()
  console.log(`✓ ${role._id}: ${summary}`)
}

console.log(DRY_RUN ? '\nDry run — nothing was written.' : '\nDone. Reload /experience to see it.')
