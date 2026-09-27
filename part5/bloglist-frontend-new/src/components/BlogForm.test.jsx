import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> calls addBlog with the details typed in the form', async () => {
  const addBlog = vi.fn()
  const user = userEvent.setup()

  // MemoryRouter: serve perché BlogForm usa useNavigate() al submit,
  // e quell'hook richiede un Router antenato per funzionare
  render(
    <MemoryRouter>
      <BlogForm addBlog={addBlog} />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Title:'), 'testing a form...')
  await user.type(screen.getByLabelText('Author:'), 'John Doe')
  await user.type(screen.getByLabelText('URL:'), 'https://example.com')
  await user.click(screen.getByRole('button', { name: 'save' }))

  expect(addBlog.mock.calls).toHaveLength(1)
  expect(addBlog.mock.calls[0][0]).toEqual({
    title: 'testing a form...',
    author: 'John Doe',
    url: 'https://example.com',
  })
})
