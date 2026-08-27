'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export type MenuLink = {
  key: string
  label: string
  href: string
  external?: boolean
  /** The pages under this one — Experience's roles, Projects' case studies. */
  children?: Array<{ key: string; href: string; label: string }>
}

export function MobileMenu({ links, name }: { links: MenuLink[]; name: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [openedAt, setOpenedAt] = useState(pathname)

  // Navigating closes the menu — including via browser back, which no click handler
  // would catch. Adjusting state during render rather than in an effect avoids a
  // pass where the overlay is still painted over the page you just moved to.
  if (openedAt !== pathname) {
    setOpenedAt(pathname)
    setOpen(false)
  }

  // A full-screen overlay that scrolls the page behind it feels broken.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="burger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-top">
            <span>{name}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mobile-menu-nav">
            {links.map((l) =>
              l.external ? (
                <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ) : (
                // The drawer has room the masthead does not, so the subpages are
                // simply listed rather than hidden behind a second tap.
                <div key={l.key} className="mobile-menu-item">
                  <Link href={l.href} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                  {(l.children?.length ?? 0) > 0 && (
                    <div className="mobile-menu-sub">
                      {l.children!.map((c) => (
                        <Link key={c.key} href={c.href} onClick={() => setOpen(false)}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </>
  )
}
