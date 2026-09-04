'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * A nav item that knows whether it is the page you are on.
 *
 * Matching is exact rather than prefix-based, so a role's page does not also light up
 * Experience — `NavGroup` is the one that marks a whole section, and it says so with
 * `data-section` rather than with `aria-current`.
 */
export function NavLink({
  href,
  external,
  className,
  children,
}: {
  href: string
  external?: boolean
  className?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }

  const active = pathname === href

  return (
    <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}
