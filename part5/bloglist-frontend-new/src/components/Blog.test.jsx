import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  title: 'Component testing is done with react-testing-library',
  author: 'John Doe',
  url: 'https://example.com',
  likes: 5,
  user: {
    name: 'John Doe',
  },
}

// chiamato "loggedInUser" (non "user") per non confondersi con la variabile
// user = userEvent.setup() usata più sotto nei singoli test
const loggedInUser = { username: 'testuser', name: 'Test User' }

// Blog usa useNavigate() (per il redirect dopo la cancellazione), quindi
// ha bisogno di un Router antenato anche nei test: MemoryRouter lo fornisce
// senza toccare l'URL vero del browser
const renderBlog = (props) =>
  render(
    <MemoryRouter>
      <Blog blog={blog} {...props} />
    </MemoryRouter>,
  )

test('renders title, url and likes', () => {
  renderBlog()

  expect(
    screen.getByText(
      'Component testing is done with react-testing-library',
      { exact: false },
    ),
  ).toBeInTheDocument()
  expect(screen.getByText('https://example.com')).toBeInTheDocument()
  expect(screen.getByText('likes 5', { exact: false })).toBeInTheDocument()
})

test('clicking the like button calls the event handler once', async () => {
  const mockHandler = vi.fn()

  renderBlog({ updateLikes: mockHandler, user: loggedInUser })

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'like' }))

  expect(mockHandler.mock.calls).toHaveLength(1)
})

test('clicking the like button twice calls the event handler twice', async () => {
  const mockHandler = vi.fn()

  renderBlog({ updateLikes: mockHandler, user: loggedInUser })

  const user = userEvent.setup()
  const button = screen.getByRole('button', { name: 'like' })
  await user.click(button)
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(2)
})

// 5.27: il pulsante 'like' dipende solo da user (loggato o no), il
// pulsante 'delete' dipende solo da isOwner (calcolato in App.jsx
// confrontando blog.user.username con user.username)
describe('authorization of action buttons', () => {
  test('when not logged in, neither like nor delete button is shown', () => {
    renderBlog()

    expect(screen.queryByRole('button', { name: 'like' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull()
  })

  test('when logged in but not the owner, only like button is shown', () => {
    renderBlog({ user: loggedInUser, isOwner: false })

    expect(screen.getByRole('button', { name: 'like' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull()
  })

  test('when logged in as the owner, both like and delete buttons are shown', () => {
    renderBlog({ user: loggedInUser, isOwner: true })

    expect(screen.getByRole('button', { name: 'like' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
  })
})
