import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const title = screen.getByLabelText('Title:')
  const author = screen.getByLabelText('Author:')
  const url = screen.getByLabelText('URL:')
  const sendButton = screen.getByText('Create')

  await userEvent.type(title, 'testing a form...')
  await userEvent.type(author, 'Me')
  await userEvent.type(url, 'http://example.com')
  await userEvent.click(sendButton)

  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'testing a form...',
    author: 'Me',
    url: 'http://example.com'
  })
})