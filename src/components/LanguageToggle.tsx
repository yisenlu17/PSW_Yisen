import Link from 'next/link'
import type { Locale } from '@/lib/locale'

export function LanguageToggle({ current }: { current: Locale }) {
  const next: Locale = current === 'en' ? 'zh' : 'en'
  return (
    <Link href={`/?lang=${next}`} className="lang-toggle" prefetch={false}>
      {next === 'zh' ? '中文' : 'EN'}
    </Link>
  )
}
