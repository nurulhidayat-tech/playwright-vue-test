import { expect, test, type Page } from '@playwright/test'

const USERNAME = 'vue'
const PASSWORD = 'vue'
const AUTH_STORAGE_KEY = 'vue-auth'

async function signIn(page: Page, username = USERNAME, password = PASSWORD): Promise<void> {
  await page.getByTestId('username-input').fill(username)
  await page.getByTestId('password-input').fill(password)
  await page.getByTestId('login-submit').click()
}

test.describe('Authentication UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('1. renders the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('username-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeEnabled()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('2. blocks submit while fields are empty', async ({ page }) => {
    await page.getByTestId('login-submit').click()

    const usernameValid = await page
      .getByTestId('username-input')
      .evaluate((el) => (el as HTMLInputElement).checkValidity())
    const passwordValid = await page
      .getByTestId('password-input')
      .evaluate((el) => (el as HTMLInputElement).checkValidity())

    expect(usernameValid).toBe(false)
    expect(passwordValid).toBe(false)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByTestId('login-error')).toHaveCount(0)
  })

  test('3. shows an error for a wrong password', async ({ page }) => {
    await signIn(page, USERNAME, 'wrong-password')

    await expect(page.getByTestId('login-error')).toBeVisible()
    await expect(page.getByTestId('login-error')).toContainText('Invalid username or password.')
    await expect(page).toHaveURL(/\/login$/)
    expect(await page.evaluate((key) => localStorage.getItem(key), AUTH_STORAGE_KEY)).toBeNull()
  })

  test('4. shows an error for an unknown username', async ({ page }) => {
    await signIn(page, 'not-vue', PASSWORD)

    await expect(page.getByTestId('login-error')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('5. signs in with vue/vue and lands on the profile', async ({ page }) => {
    await signIn(page)

    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByTestId('profile-username')).toHaveText(USERNAME)
    await expect(page.getByTestId('logout-button')).toBeVisible()
  })

  test('6. redirects guests away from the protected profile', async ({ page }) => {
    await page.goto('/profile')

    await expect(page.getByTestId('login-form')).toBeVisible()
    const redirected = new URL(page.url())
    expect(redirected.pathname).toBe('/login')
    expect(redirected.searchParams.get('redirect')).toBe('/profile')

    await signIn(page)
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('7. logs out and clears the stored session', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/profile$/)

    await page.getByTestId('logout-button').click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByTestId('login-form')).toBeVisible()
    expect(await page.evaluate((key) => localStorage.getItem(key), AUTH_STORAGE_KEY)).toBeNull()
  })

  test('8. keeps the session after a page reload', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/profile$/)

    await page.reload()

    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByTestId('profile-username')).toHaveText(USERNAME)
  })

  test('9. sends an already authenticated user from /login to /profile', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/profile$/)

    await page.goto('/login')

    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByTestId('profile-username')).toHaveText(USERNAME)
  })
})
