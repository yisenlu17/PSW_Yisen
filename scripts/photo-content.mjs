/**
 * The photographs — where each one goes, and what it says.
 *
 * The project screenshots have `project-content.mjs`; this is the same idea for the
 * pictures that are not of software: two from the internships, five from weekends,
 * and the four video covers the two 抖音 accounts put out. Kept apart from the
 * scripts that write them so a caption can be reworded without touching transport,
 * and so the uploader can be told what to upload by the same file that decides where
 * it lands.
 *
 * Files live in `media/photos/` and `media/channel/`, and are named here by filename
 * rather than by asset id, exactly as the screenshots are — the uploader searches
 * every folder for the name, so which one a picture sits in is only for finding it by
 * hand. `npm run media` puts them in the dataset; `npm run playground`,
 * `npm run project-detail` and `npm run experience-detail` point the pages at them.
 *
 * Alt text is a plain string because that is what the schemas hold — one description,
 * not one per language. Captions are the bilingual half, and only the gallery shows
 * them.
 */

const S = (en, zh) => ({ _type: 'localeString', en, zh })
const T = (en, zh) => ({ _type: 'localeText', en, zh })

/**
 * Every photograph, with what is in it.
 *
 * A hotspot is set where the crop would otherwise take the wrong half: a group shot
 * dropped into a 3:1 band, or a portrait squeezed into a square. The site crops at
 * the image service rather than in CSS, so this is the thing that decides what
 * survives. `x`/`y` are the middle of what matters, `width`/`height` how much of the
 * frame that is — all as fractions of the whole picture.
 */
const PHOTOS = {
  'stranger-soccer-hosts.jpg': {
    alt: 'Five Stranger Soccer hosts in red kit, arms around each other on an indoor pitch after a night game in Singapore.',
    // Faces sit high in a standing group shot, and the football tile is a wide band.
    hotspot: { x: 0.5, y: 0.36, width: 0.92, height: 0.5 },
  },
  'ey-desktop-procedures.png': {
    alt: 'Dozens of pages of a finance desktop procedure laid out as a grid — a cover sheet, then screen after screen of numbered steps against terminal captures.',
  },
  // The tile takes `basketball-huddle.jpg` — the top frame of `basketball.jpg`, cut
  // out as its own file. Cropping the grid down to one frame at display time left a
  // sliver of the row below along the bottom edge, which reads as a rendering fault
  // rather than as a photograph. The whole grid is kept as the file of record.
  'basketball-huddle.jpg': {
    alt: 'A team huddle between plays on an outdoor court in winter light, with a second game going on behind the fence.',
    // 1.51:1 into a tile that is about 1.43:1, so this only nudges the crop: hold it
    // low enough to keep the players and the court the name sits over.
    hotspot: { x: 0.5, y: 0.56, width: 1, height: 0.86 },
  },
  'skydive.jpg': {
    alt: 'Mid-freefall on a tandem skydive, with mountains, a lake and a town far below.',
    caption: S('Tandem jump. The grin is not staged.', '双人跳伞。那个表情不是摆出来的。'),
  },
  'sunset-shore.jpg': {
    alt: 'Standing on rocks at the water’s edge with arms outstretched, low sun and pink cloud over the sea.',
    caption: S(
      'Standing in the shallows, watching the light go.',
      '站在浅滩上，看着光一点一点落下去。'
    ),
  },
  'snorkelling.jpg': {
    alt: 'Snorkelling just under the surface of clear turquoise water, making a peace sign at the camera.',
    caption: S(
      'Underwater, and still finding time for a peace sign.',
      '都到水下了，还是要比一个耶。'
    ),
  },
  'dongwang-legend-time.png': {
    alt: 'A 懂王兄弟说球 video cover: a cartoon commentator in a headset in front of two international basketball players, under the headline 再给未来的传奇一点时间.',
  },
  'dongwang-keep-practising.png': {
    alt: 'A 懂王兄弟说球 video cover: the cartoon commentator pointing at the camera beside two international basketball players, under the headline 文班，你还得练！.',
  },
  // Both of these arrived as 抖音 share cards — the cover with a white strip under it
  // carrying the handle and a QR code. The strip is app chrome rather than artwork,
  // and on the navy strip it read as a white block, so it is cut off in the file the
  // same way `basketball-huddle.jpg` is cut out of its grid. What is left is the
  // cover as it is published, and it is still shown whole.
  'life-tuition-week-zero.jpg': {
    alt: 'A 生活与成长账号 video cover: sitting in thought against a falling candlestick chart, under the headline 学费炒股亏 7w，挑战 3 个月回本 and a Week 0 marker.',
  },
  'life-internship-rejections.jpg': {
    alt: 'A 生活与成长账号 video cover: pulling a face beside a shortlist of candidates crossed out in red, under the headline 新留学费炒股亏 7w 之 找实习失败.',
  },
  'pagoda-overlook.jpg': {
    alt: 'Leaning on a wooden balcony rail above the treetops, a tiered pagoda and a river city skyline behind.',
    caption: S('Somebody else’s good weather, borrowed.', '借了别人一个好天气。'),
    // A tall photograph going into a square: hold the crop on the figure and the
    // roofline rather than letting it settle in the middle.
    hotspot: { x: 0.5, y: 0.46, width: 0.94, height: 0.62 },
  },
}

/* ------------------------------------------------------------------ placements */

/**
 * A photograph against the piece of work it belongs to.
 *
 * `contribution` is the position in the list on that role — the same order they are
 * written in `experience-detail.mjs`, which is the script that puts them there.
 */
const EXPERIENCE_PHOTOS = [
  {
    _id: 'experience.stranger-soccer',
    contribution: 0, // Match-day operations and customer experience
    file: 'stranger-soccer-hosts.jpg',
  },
  {
    _id: 'experience.ernst-young',
    contribution: 1, // Writing the desktop procedures
    file: 'ey-desktop-procedures.png',
  },
]

/**
 * The two bento tiles that are photographs rather than coloured panels.
 *
 * Keyed by the tile's own `_key` rather than by position: the grid is reordered by
 * dragging in the studio, and a picture that followed the position instead of the
 * tile would end up behind whatever moved into that slot.
 */
const BENTO_PHOTOS = {
  basketball: 'basketball-huddle.jpg',
  football: 'stranger-soccer-hosts.jpg',
}

/**
 * How big each tile is, and the order they are written in.
 *
 * Both are here because they are one decision. A tile carries a size and not a
 * position — which is the right way round — so the only way to get a grid with no
 * gaps in it is to give each tile a size its own text actually fills, and then write
 * them in an order the browser can pack.
 *
 * Sizes follow the content: the two photographs take the space (2×2 and 2×1), the
 * paragraph that runs four lines takes a 2×1, and the three short ones take a 1×1
 * each. Nothing is left holding a fixed height open for words that were never there,
 * which is what a 1×2 tile with two lines in it was doing.
 *
 * That comes to eleven cells. On four columns they pack into three rows with a single
 * cell spare at the end; on three columns, four rows with one spare. One gap at the
 * end of the last row reads as an edge. A gap in the middle reads as a mistake.
 */
const BENTO_LAYOUT = [
  { key: 'basketball', size: 'lg' },
  { key: 'markets', size: 'wide' },
  { key: 'football', size: 'wide' },
  { key: 'sports-count', size: 'sm' },
  { key: 'badminton', size: 'sm' },
  { key: 'hotpot', size: 'sm' },
]

/**
 * Copy the grid needs whether or not there is a picture anywhere near it.
 *
 * A headline and a paragraph that say the same thing read as a mistake — which is
 * what "Two products and a commentary account" over "Two products and a commentary
 * account came out of this one" was. Only the tiles listed here are touched; the rest
 * of the grid is whatever the studio says.
 */
const BENTO_COPY = {
  basketball: {
    // "Two products and a commentary account" over "Two products and a commentary
    // account came out of this one" read as a mistake — one line is the tile's worth.
    kicker: S('Basketball', '篮球'),
    body: T(
      'Both of them, and the account, started on a court like this one.',
      '两个产品和那个账号，都是从这样的球场上开始的。'
    ),
  },
  // The kickers paired both languages in the English field — "Basketball · 篮球" —
  // which is one language too many for a visitor who has already chosen one.
  football: { kicker: S('Football', '足球') },
  badminton: { kicker: S('Badminton', '羽毛球') },
}

/**
 * The accounts' own covers.
 *
 * Neither account is a page of its own — both are lines in the strip under the
 * projects — so the covers go on those documents as their gallery and the strip
 * shows the first two. They are shown whole and small, never as a background with
 * type over them: each one is already a finished piece of artwork with its own
 * headline on it.
 *
 * The two accounts do not agree on shape — 懂王兄弟说球 posts landscape covers,
 * 生活与成长账号 portrait ones — and neither is going to be cropped to match the
 * other. The strip holds them to a height instead of a width, so a landscape pair
 * and a portrait pair still sit in the same band and the two columns read as a row.
 */
const ACCOUNT_COVERS = {
  'project.dongwang-brothers': ['dongwang-legend-time.png', 'dongwang-keep-practising.png'],
  // Week 0 opens the series, so it goes first — the strip shows them in this order.
  'project.life-channel': ['life-tuition-week-zero.jpg', 'life-internship-rejections.jpg'],
}

/**
 * The photographs that are not evidence of anything.
 *
 * Masonry rather than a grid: these are three landscapes and a portrait, and a grid
 * would crop all four to the same rectangle to prove they belong together. They do
 * not need to.
 */
const GALLERY = {
  _key: 'photos',
  _type: 'photoGallerySection',
  eyebrow: S('Elsewhere', '别处'),
  title: S('And the weekends that turned into nothing at all', '还有一些没变成任何东西的周末'),
  lede: T(
    'The page above argues that what I do on weekends is where the work comes from. Not all of it. Some of it was just the weekend.',
    '上面那一整页都在说：我做的东西来自周末在干的事。也不全是。有些周末就只是周末而已。'
  ),
  variant: 'masonry',
  photos: ['skydive.jpg', 'sunset-shore.jpg', 'snorkelling.jpg', 'pagoda-overlook.jpg'],
  settings: {
    _type: 'sectionSettings',
    label: 'Photographs',
    theme: 'cream',
    spacing: 'normal',
  },
  /** Goes in before the closing CTA, which stays last on every page. */
  before: 'contact',
}

/** Every file the placements above name — what `npm run media` has to upload. */
function photoFiles() {
  const files = new Map()
  const add = (file, use) => {
    if (!PHOTOS[file]) throw new Error(`${file} is placed but not described in PHOTOS`)
    const row = files.get(file) ?? { file, alt: PHOTOS[file].alt, uses: [] }
    row.uses.push(use)
    files.set(file, row)
  }

  for (const spot of EXPERIENCE_PHOTOS) add(spot.file, `${spot._id.replace(/^experience\./, '')} contribution`)
  for (const [key, file] of Object.entries(BENTO_PHOTOS)) add(file, `playground ${key} tile`)
  for (const file of GALLERY.photos) add(file, 'playground gallery')
  for (const [id, files] of Object.entries(ACCOUNT_COVERS)) {
    for (const file of files) add(file, `${id.replace(/^project\./, '')} cover`)
  }

  return [...files.values()]
}

export { PHOTOS, EXPERIENCE_PHOTOS, BENTO_PHOTOS, BENTO_LAYOUT, BENTO_COPY, ACCOUNT_COVERS, GALLERY, photoFiles }
