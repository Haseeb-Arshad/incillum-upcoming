import { BackToTop, FooterWordmark } from '#/components/footer-wordmark.tsx'
import { AnalyticsSettingsButton } from '#/components/analytics-consent.tsx'
import { MastheadBar } from '#/components/masthead-bar.tsx'
import { Container } from '#/components/primitives.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { brand, menu } from '#/content/site.ts'

import type { ReactNode } from 'react'

/**
 * The frame every page after the front page is laid in: the same masthead, a
 * pane of glass from the start, then the page on white paper, then the footer.
 *
 * These pages have no night, so the masthead takes the paper's tokens and
 * there is no dark region on them at all. The footer is the front page's,
 * without the motto: its two placements are the front page's close and the
 * success state of its form.
 */
export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="glass page-frame">
      <MastheadBar scrolled onFront={false} />
      <div className="desk page-frame-body">
        {children}
        <footer className="glass-footer" role="contentinfo">
          <Container>
            <nav aria-label="Sections" className="glass-footer-nav">
              {[...menu.groups.flatMap((group) => group.items), ...menu.links].map(
                (item) => (
                  <a key={item.href} href={item.href}>
                    {item.title}
                  </a>
                ),
              )}
              <AnalyticsSettingsButton />
              <BackToTop />
            </nav>
            <div className="glass-footer-inner">
              <SiteBrand />
              <p className="glass-copyright">
                © {new Date().getFullYear()} {brand.name}
              </p>
            </div>
          </Container>
          <FooterWordmark />
        </footer>
      </div>
    </div>
  )
}
