import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BlogForm = ({ addBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newURL, setNewURL] = useState('')

  const navigate = useNavigate()

  const handleAddBlog = (event) => {
    event.preventDefault()
    addBlog({ title: newTitle, author: newAuthor, url: newURL })
    setNewTitle('')
    setNewAuthor('')
    setNewURL('')
    navigate('/')
  }

  return (
    <>
      <h2>Create a new blog</h2>

      <form onSubmit={handleAddBlog}>
        <div>
          <label>
            Title:
            <input
              id="title"
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Author:
            <input
              id="author"
              type="text"
              value={newAuthor}
              onChange={(event) => setNewAuthor(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            URL:
            <input
              id="url"
              type="text"
              value={newURL}
              onChange={(event) => setNewURL(event.target.value)}
            />
          </label>
        </div>

        <div>
          <button type="submit">save</button>
        </div>
      </form>
    </>
  )
}

export default BlogForm
