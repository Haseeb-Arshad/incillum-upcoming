import { expect, test } from '@playwright/test'

/**
 * Every call to action is the grotesk, in sentence case, at reading size.
 *
 * The buttons were once the heading serif in tracked capitals at 12.5px, and on
 * a phone they shrank to 10.5px. Nothing failed, because nothing looked at the
 * computed style. This does: it runs at all four viewport projects, so a rule
 * that quietly shrinks a button at 390px fails here.
 */
const CONTROLS = 'button[type="submit"], a.ic-cta, .desk-cta, .memo-action, .memo-submit, .waitlist-inline-submit'

for (const path of ['/', '/contact']) {
  test(`${path}: every button is the sans, in sentence case, at 15px or more`, async ({
    page,
  }) => {
    await page.goto(path)
    await page.waitForSelector('html[data-hydrated="true"]')

    const controls = await page.locator(CONTROLS).evaluateAll((elements) =>
      elements
        .filter((element) => (element as HTMLElement).offsetParent !== null)
        .map((element) => {
          const style = getComputedStyle(element)
          return {
            text: (element.textContent ?? '').trim().slice(0, 40),
            family: style.fontFamily,
            size: parseFloat(style.fontSize),
            transform: style.textTransform,
            height: element.getBoundingClientRect().height,
          }
        }),
    )

    expect(controls.length).toBeGreaterThan(0)
    for (const control of controls) {
      expect(control.family, control.text).toMatch(/^"?Incillum Sans/)
      expect(control.transform, control.text).toBe('none')
      expect(control.size, control.text).toBeGreaterThanOrEqual(15)
    }
    // A touch target. The memo's select shows a typed value rather than a call
    // to action, so it is not in this set.
    for (const control of controls) {
      expect(control.height, control.text).toBeGreaterThanOrEqual(44)
    }
  })
}
