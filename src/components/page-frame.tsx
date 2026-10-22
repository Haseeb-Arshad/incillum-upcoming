import { MastheadBar } from '#/components/masthead-bar.tsx'
import { Container } from '#/components/primitives.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { brand, menu } from '#/content/site.ts'

import type { ReactNode } from 'react'

/**
 * The frame every page after the front page is laid in: the same masthead,
 * filled from the start, then the page on the desk, then the footer.
 *
 * The masthead is the night's bar, so it sits in its own `[data-inverted]`
 * scope — the one dark region on these pages, as the night is on the front
 * page. The footer is the front page's, without the motto: its two placements
 * are the front page's close and the success state of its form.
 */
export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="glass page-frame">
      <div data-inverted="" className="page-frame-bar">
        <MastheadBar scrolled onFront={false} />
      </div>
      <div className="desk page-frame-body">
        {children}
        <footer className="glass-footer" role="contentinfo">
          <Container>
            <nav aria-label="Sections" className="glass-footer-nav">
              {[...menu.groups.flatMap((group) => group.items), ...menu.links].map((item) => (
                <a key={item.href} href={item.href}>
                  {item.title}
                </a>
              ))}
            </nav>
            <div className="glass-footer-inner">
              <SiteBrand />
              <p className="glass-copyright">
                © {new Date().getFullYear()} {brand.name}
              </p>
            </div>
          </Container>
        </footer>
      </div>
    </div>
  )
}
