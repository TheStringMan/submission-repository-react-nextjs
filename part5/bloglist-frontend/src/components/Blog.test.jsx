import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author but not url or likes by default', () => {
    const blog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    }

    render(<Blog blog={blog} />)

    const element = screen.getByText('Canonical string reduction by Edsger W. Dijkstra')
    expect(element).toBeInTheDocument()

    expect(screen.queryByText(blog.url)).toBeNull()
    expect(screen.queryByText('12 likes')).toBeNull()
})

test('shows url and likes after clicking the view button', async () => {
    const blog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    }

    const userLog = { username: 'tester' }
    render(<Blog blog={blog} user={userLog} />)

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    expect(screen.getByText(blog.url)).toBeInTheDocument()
    expect(screen.getByText('12 likes')).toBeInTheDocument()
})

test('calls updateLikes twice if like button is clicked twice', async () => {
  const blog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    user: { username: 'tester' } // aggiungi user dentro il blog se necessario
  }

  const mockHandler = vi.fn()
  const userLog = { username: 'tester' }

  render(<Blog blog={blog} user={userLog} updateLikes={mockHandler} />)

  const user = userEvent.setup()

  // Mostriamo i dettagli del blog
  const buttonView = screen.getByText('view')
  await user.click(buttonView)

  // Clicchiamo due volte il bottone "like"
  const buttonLike = screen.getByRole('button', { name: /like/i })
  await user.click(buttonLike)
  await user.click(buttonLike)

  expect(mockHandler.mock.calls).toHaveLength(2)
})