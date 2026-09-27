import { useState, useEffect } from 'react'
import { Routes, Route, Link, useMatch, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import BlogList from './components/BlogList'
import Footer from './components/Footer'

import blogService from './services/blogs'
import loginService from './services/login'

const padding = { padding: 5 }

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('error')

  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      navigate('/')
    } catch {
      setMessageType('error')
      setMessage('wrong credentials')
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
    navigate('/')
  }

  const handleAddBlog = async (blog) => {
    try {
      const newBlog = {
        title: blog.title,
        author: blog.author,
        url: blog.url,
      }
      const savedBlog = await blogService.create(newBlog)
      setBlogs(
        blogs.concat({
          ...savedBlog,
          user: { username: user.username, name: user.name },
        }),
      )
      setMessageType('success')
      setMessage(`A new blog ${savedBlog.title} by ${savedBlog.author} added`)
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (error) {
      setMessageType('error')
      setMessage(`Error saving blog ${error.response.data.error}`)
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleUpdateLikes = async (blog) => {
    const updated = await blogService.update(blog.id, {
      ...blog,
      likes: blog.likes + 1,
    })
    setBlogs((current) =>
      current.map((b) =>
        b.id === blog.id ? { ...updated, user: blog.user } : b,
      ),
    )
  }

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return false
    }

    try {
      await blogService.deleteBlog(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
      return true
    } catch (error) {
      setMessageType('error')
      setMessage(
        `Error deleting blog ${error.response?.data?.error ?? error.message}`,
      )
      setTimeout(() => {
        setMessage(null)
      }, 5000)
      return false
    }
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

      {message && <div className={messageType}>{message}</div>}

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
        <Route path="/login" element={<LoginForm login={handleLogin} />} />
        <Route path="/create" element={<BlogForm addBlog={handleAddBlog} />} />
        <Route path="/" element={<BlogList blogs={blogs} />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
