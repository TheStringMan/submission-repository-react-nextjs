const { test, expect } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

test.describe('Blog app', () => {
  // azzera il database di test e crea un utente noto, tramite l'API vera
  // (non tramite il modello Mongoose: il test non ha accesso diretto al codice del server)
  //
  // "request" qui è la fixture che Playwright passa al test, non il modulo
  // importato in cima al file: eredita il baseURL da playwright.config.js,
  // quindi i path relativi passano dal proxy di Vite fino al backend vero
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'sekret123',
      },
    })

    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    // exact: true perché senza serebbe ambiguo con l'<h2>blogs</h2> della
    // lista sottostante (match case-insensitive di default)
    await expect(
      page.getByRole('heading', { name: 'Blogs', exact: true }),
    ).toBeVisible()
  })

  test('login form can be opened', async ({ page }) => {
    // "login" ora è un link verso /login (pagina a sé), non più un
    // pulsante che apre un form sulla stessa pagina
    await page.getByRole('link', { name: 'login' }).click()

    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
  })

  test('user can log in with correct credentials', async ({ page }) => {
    await loginWith(page, 'testuser', 'sekret123')
    await expect(page.getByText('Test User logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'testuser', 'wrong')

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(211, 47, 47)')

    await expect(page.getByText('wrong credentials')).toBeVisible()
    await expect(page.getByText('Test User logged in')).not.toBeVisible()
  })

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'sekret123')
    })

    test('a new blog post can be created', async ({ page }) => {
      await createBlog(
        page,
        'a blog post created by playwright',
        'John Doe',
        'http://example.com',
      )
      // il titolo compare sia nel banner di successo sia nel link della
      // lista: .first() basta per confermare che il blog sia stato creato
      await expect(
        page.getByText('a blog post created by playwright').first(),
      ).toBeVisible()
    })

    test.describe('and a blog exists', () => {
      test.beforeEach(async ({ page }) => {
        await createBlog(
          page,
          'a blog post created by playwright',
          'John Doe',
          'http://example.com',
        )
      })

      test('likes can be changed', async ({ page }) => {
        // il blog non ha più un pulsante "view": si apre la sua pagina
        // dedicata cliccando il link con il titolo, nella lista
        await page
          .getByRole('link', { name: 'a blog post created by playwright' })
          .click()

        await expect(
          page.getByText('likes 0', { exact: false }),
        ).toBeVisible()

        await page.getByRole('button', { name: 'like' }).click()

        await expect(
          page.getByText('likes 1', { exact: false }),
        ).toBeVisible()
      })

      test('the creator can delete the blog', async ({ page }) => {
        await page
          .getByRole('link', { name: 'a blog post created by playwright' })
          .click()

        // NON avvolgere il click in Promise.all insieme al dialog: il click
        // resta "in sospeso" per Playwright finché il dialog (che blocca
        // l'esecuzione sincrona di window.confirm) non viene chiuso, e
        // dialog.accept() dentro Promise.all arriverebbe solo dopo che il
        // click si è già risolto -> stallo. Basta registrare l'handler
        // PRIMA del click, senza attenderlo insieme ad esso.
        page.once('dialog', (dialog) => dialog.accept())
        await page.getByRole('button', { name: 'delete' }).click()

        // la cancellazione riporta alla lista ("/"): il link non c'è più
        await expect(
          page.getByRole('link', { name: 'a blog post created by playwright' }),
        ).toHaveCount(0)
      })

      test('only the creator sees the delete button', async ({
        page,
        request,
      }) => {
        await page
          .getByRole('link', { name: 'a blog post created by playwright' })
          .click()
        await expect(page.getByRole('button', { name: 'delete' })).toBeVisible()

        await page.getByRole('button', { name: 'logout' }).click()
        await request.post('/api/users', {
          data: {
            name: 'Other User',
            username: 'otheruser',
            password: 'sekret456',
          },
        })
        await loginWith(page, 'otheruser', 'sekret456')

        await page.getByRole('link', { name: 'blogs' }).click()
        await page
          .getByRole('link', { name: 'a blog post created by playwright' })
          .click()

        await expect(page.getByRole('button', { name: 'like' })).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'delete' }),
        ).not.toBeVisible()
      })
    })
  })
})
