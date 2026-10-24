import { useEffect } from 'react'
import { Routes, Route, Link, useMatch, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import BlogList from './components/BlogList'
import Users from './components/Users'
import UserDetail from './components/UserDetail'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import { useNotification } from './NotificationContext'
import {
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
} from './hooks/useBlogs'
import { useUser } from './UserContext'
import { useLogin } from './hooks/useLogin'

import blogService from './services/blogs'

const padding = { padding: 5 }

const App = () => {
  const result = useBlogs()
  const blogs = result.data ?? []

  const { user, loginUser, logoutUser } = useUser()
  const loginMutation = useLogin()

  const { notification: message } = useNotification()

  const navigate = useNavigate()
  const createBlogMutation = useCreateBlog()
  const updateBlogMutation = useUpdateBlog()
  const deleteBlogMutation = useDeleteBlog()

  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      loginUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials, {
      onSuccess: () => navigate('/'),
    })
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const handleAddBlog = (blog) => {
    const newBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
    }
    createBlogMutation.mutate(newBlog)
  }

  const handleUpdateLikes = (blog) => {
    updateBlogMutation.mutate({
      id: blog.id,
      blog: { ...blog, likes: blog.likes + 1 },
    })
  }

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return false
    }
    deleteBlogMutation.mutate({ id })
    return true
  }

  if (result.isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h1>Blogs</h1>

      <div>
        <Link style={padding} to="/">
          blogs
        </Link>
        {!user && (
          <Link style={padding} to="/login">
            login
          </Link>
        )}
        {user && (
          <Link style={padding} to="/users">
            users
          </Link>
        )}
        {user && (
          <Link style={padding} to="/create">
            new blog
          </Link>
        )}
        {user && (
          <span style={padding}>
            {user.name} logged in{' '}
            <button type="submit" onClick={handleLogout}>
              logout
            </button>
          </span>
        )}
      </div>

      {message && <div className={message.type}>{message.message}</div>}

      <ErrorBoundary>
        <Routes>
          <Route
            path="/blogs/:id"
            element={
              <Blog
                blog={blog}
                updateLikes={handleUpdateLikes}
                deleteBlog={handleDeleteBlog}
                isOwner={blog?.user?.username === user?.username}
                user={user}
              />
            }
          />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/login" element={<LoginForm login={handleLogin} />} />
          <Route
            path="/create"
            element={<BlogForm addBlog={handleAddBlog} />}
          />
          <Route path="/" element={<BlogList blogs={blogs} />} />
          <Route path="/users" element={<Users />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </ErrorBoundary>
    </>
  )
}

export default App
