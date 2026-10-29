import { expect, test } from '@playwright/test'

const password = 'incillum-playwright-brief-password'

test('the private brief stays closed until its password is accepted', async ({
  page,
}) => {
  const response = await page.goto('/brief')
  expect(response?.status()).toBe(200)
  expect(response?.headers()['cache-control']).toContain('private')
  expect(response?.headers()['cache-control']).toContain('no-store')
  await expect(page).toHaveTitle('Incillum | Private brief')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  )
  await expect(page.getByRole('heading', { name: 'A private brief.' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Stay with the work.')
  await expect(
    page.getByRole('heading', { name: 'The problem, in numbers' }),
  ).toHaveCount(0)
  expect(await response?.text()).not.toContain('The problem, in numbers')

  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Open the brief' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'That password did not match. Try again.',
  )
  await expect(
    page.getByRole('heading', { name: 'The problem, in numbers' }),
  ).toHaveCount(0)

  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Open the brief' }).click()
  await expect(page.getByRole('heading', { name: 'Incillum, in brief' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Where it stands' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.locator('.brief-sources li')).toHaveCount(6)
  await expect(page.locator('body')).not.toContainText('Stay with the work.')
  const cookie = (await page.context().cookies()).find(
    (entry) => entry.name === 'incillum_brief',
  )
  expect(cookie).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
  })

  const reloaded = await page.reload()
  expect(reloaded?.headers()['cache-control']).toContain('private')
  expect(reloaded?.headers()['cache-control']).toContain('no-store')
  await expect(page.getByRole('heading', { name: 'Incillum, in brief' })).toBeVisible()
})
