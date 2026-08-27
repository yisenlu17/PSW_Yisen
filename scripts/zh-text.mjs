/**
 * How Chinese copy is punctuated, as one rule in one place.
 *
 * The site was seeded from the prototype's JSON, which typed its Chinese with ASCII
 * commas and colons — 「六项运动,一个股市」 rather than 「六项运动，一个股市」. Everything
 * written since has used the full-width marks, so the two conventions now sit in the
 * same section in places.
 *
 * This is not a preference. A full-width comma carries its own trailing space inside
 * the glyph, which is what gives Chinese its even colour; an ASCII one butts the next
 * character straight up against the stroke, and at heading sizes the gap it leaves is
 * wide enough to read as a mistake. It also costs a line: the ASCII marks are
 * narrower, so a heading measured to fit on one line sets one way here and another
 * way once it is corrected.
 *
 * Kept apart from the script that applies it because it has two callers — the pass
 * over the dataset (`npm run zh-punctuation`) and the seed's own source copy, which
 * has to agree with it or a reseed would undo the fix.
 */

/** Han, kana, and the CJK punctuation and full-width blocks. */
const CJK = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/

const FULL_WIDTH = { ',': '，', ':': '：', ';': '；', '!': '！', '?': '？' }

/**
 * One string of Chinese, punctuated the way Chinese is punctuated.
 *
 * A mark is only converted where it sits against a CJK character on one side or the
 * other. That is what keeps `1.29°N 103.85°E`, `中文 · English · 日本語` and the
 * numbers scattered through the copy intact — a comma between two Latin characters is
 * a Latin comma even inside a Chinese sentence, and converting it would set a
 * full-width mark in the middle of an English phrase.
 *
 * The trailing rule is the other half of the same idea: a Latin comma that survived
 * is still a Latin comma, and Latin commas take a space after them. The prototype's
 * `Orfeostory,2026` had neither.
 */
export function normalizeZh(text) {
  if (typeof text !== 'string' || !CJK.test(text)) return text

  let out = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const full = FULL_WIDTH[char]
    if (full && (CJK.test(text[i - 1] ?? '') || CJK.test(text[i + 1] ?? ''))) {
      out += full
      // A full-width mark already carries its space, so a space that followed the
      // ASCII one would now set two gaps in a row.
      while (text[i + 1] === ' ') i++
      continue
    }
    out += char
  }

  return out.replace(/([A-Za-z0-9])([,;:])(?=[A-Za-z0-9])/g, '$1$2 ')
}

/**
 * Which fields on a document hold Chinese.
 *
 * Decided by name rather than by sniffing the text. Guessing from content would
 * eventually catch an English field with a Chinese product name in it and repunctuate
 * an English sentence — which is not hypothetical: the alt text on one 我是懂球王
 * screenshot opens "The 懂球卡 on 我是懂球王: 懂王 score, career honour, …", and a pass
 * that went by content turned that English colon full-width.
 *
 * So `alt` is excluded by name even inside `bodyZh`. It describes the picture for a
 * screen reader in English wherever it sits, because that is the one string the
 * schemas keep in a single language.
 */
export function isChineseField(key, path) {
  if (key === 'zh' || key === 'titleLocal' || key === 'nameLocal') return true
  if (!path.includes('bodyZh')) return false

  // Inside a Chinese write-up: prose is `children[].text`, and a `flowSteps` block
  // carries a `label` and an array of `steps`, both written in the language of the
  // body they sit in.
  return key === 'text' || key === 'label' || /\.steps\[\d+\]$/.test(path)
}
