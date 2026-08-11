import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/lib/locale'

/**
 * The pieces both detail pages share.
 *
 * A project page and a role page are the same document read at two depths, so their
 * furniture — the dark masthead, the back link, the labelled blocks, the metric row —
 * is defined once here. Keeping them identical is the point: a visitor who has read
 * one already knows how to read the other.
 */

export function DetailHeader({
  eyebrow,
  title,
  meta,
  lede,
  chips,
  backHref,
  backLabel,
  children,
}: {
  eyebrow?: string
  title: string
  meta?: string
  lede?: string
  chips?: ReactNode
  backHref: string
  backLabel: string
  children?: ReactNode
}) {
  return (
    <header className="detail-head">
      <div className="wrap">
        <Link href={backHref} className="detail-back">
          <span aria-hidden>←</span> {backLabel}
        </Link>

        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {meta && <p className="detail-meta">{meta}</p>}
        {lede && <p className="detail-lede">{lede}</p>}
        {chips && <div className="detail-chips">{chips}</div>}
        {children}
      </div>
    </header>
  )
}

/** A labelled prose block — "The problem", "What I did", "What happened". */
export function DetailBlock({ label, body }: { label: string; body?: string }) {
  if (!body) return null
  return (
    <div className="detail-block">
      <h2>{label}</h2>
      <p>{body}</p>
    </div>
  )
}

/** A labelled list of one-liners. */
export function DetailList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="detail-block">
      <h2>{label}</h2>
      <ul className="detail-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function MetricRow({
  metrics,
}: {
  metrics: Array<{ _key: string; value?: string | null; label?: string; source?: string }>
}) {
  if (metrics.length === 0) return null
  return (
    <div className="detail-metrics">
      {metrics.map((metric) => (
        <div key={metric._key} className="detail-metric">
          <span className="detail-metric-value">{metric.value}</span>
          {metric.label && <span className="detail-metric-label">{metric.label}</span>}
          {metric.source && <span className="detail-metric-source">{metric.source}</span>}
        </div>
      ))}
    </div>
  )
}

/** Wording that belongs to the page rather than to the dataset. */
export const DETAIL_COPY = {
  en: {
    backToProjects: 'All projects',
    backToExperience: 'All experience',
    problem: 'The problem',
    approach: 'What I did',
    outcome: 'What happened',
    features: 'What it does',
    learnings: 'What I learned',
    responsibilities: 'What I was responsible for',
    problemsSolved: 'Problems solved',
    builtWith: 'Built with',
    skills: 'Skills',
    gallery: 'Gallery',
    related: 'Related projects',
    cameOutOfThis: 'What came out of this',
    fromThisRole: 'From this role',
    documents: 'Documents',
    links: 'Links',
  },
  zh: {
    backToProjects: '全部项目',
    backToExperience: '全部经历',
    problem: '问题是什么',
    approach: '我做了什么',
    outcome: '结果如何',
    features: '它能做什么',
    learnings: '我学到了什么',
    responsibilities: '我负责的部分',
    problemsSolved: '解决的问题',
    builtWith: '技术栈',
    skills: '相关能力',
    gallery: '截图',
    related: '相关项目',
    cameOutOfThis: '由此产生的项目',
    fromThisRole: '来自这段经历',
    documents: '文件',
    links: '链接',
  },
} as const

export const copy = (locale: Locale) => DETAIL_COPY[locale] ?? DETAIL_COPY.en
