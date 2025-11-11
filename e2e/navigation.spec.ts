import { test, expect } from '@playwright/test'

test.describe('Report Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('Rapport Durable Clauger 2025')

    await expect(page.getByText(/62\/100/i)).toBeVisible()
  })

  test('navigate to report viewer', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /explorer le rapport/i }).click()

    await expect(page).toHaveURL(/\/rapport\?page=1/)

    await expect(page.getByText(/Page 1 \/ 36/)).toBeVisible()
  })

  test('navigate between pages using arrows', async ({ page }) => {
    await page.goto('/rapport?page=1')

    await page.getByRole('button', { name: /page suivante/i }).click()

    await expect(page).toHaveURL(/\/rapport\?page=2/)

    await page.getByRole('button', { name: /page précédente/i }).click()

    await expect(page).toHaveURL(/\/rapport\?page=1/)
  })

  test('search modal opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/rapport?page=1')

    await page.keyboard.press('Meta+K')

    await expect(page.getByPlaceholder(/rechercher/i)).toBeVisible()
  })

  test('help page is accessible', async ({ page }) => {
    await page.goto('/help')

    await expect(page.locator('h1')).toContainText(/aide/i)

    await expect(page.getByText(/raccourcis clavier/i)).toBeVisible()
  })
})
