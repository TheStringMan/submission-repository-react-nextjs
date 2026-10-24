import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddComment } from '../hooks/useBlogs'

const Blog = ({ blog, updateLikes, deleteBlog, isOwner, user }) => {
  const [newComment, setNewComment] = useState('')

  const navigate = useNavigate()

  const addCommentMutuation = useAddComment()

  const handleAddComment = (event) => {
    event.preventDefault()
    addCommentMutuation.mutate({ id: blog.id, comment: newComment })
    setNewComment('')
  }

  // deleteBlog è la stessa funzione di App.jsx (conferma + chiamata API +
  // aggiornamento dello stato) — qui aggiungiamo solo la navigazione,
  // possibile solo qui perché Blog è un discendente di <Router>, a
  // differenza di App che <Router> lo crea
  const handleDelete = async () => {
    const deleted = await deleteBlog(blog.id)
    if (deleted) {
      navigate('/')
    }
  }

  return (
    <>
      {blog && (
        <div className="blog">
          <h2>{blog.title}</h2>
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{' '}
            {user && <button onClick={() => updateLikes(blog)}>like</button>}
          </div>
          {blog.author}
          <div>Added by {blog.user?.name}</div>
          {user && isOwner && <button onClick={handleDelete}>delete</button>}

          <h2>Comments</h2>
          <form onSubmit={handleAddComment}>
            <div>
              <label>
                Comment:
                <input
                  id="comment"
                  type="text"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                />
              </label>
            </div>

            <div>
              <button type="submit">Add Comment</button>
            </div>
          </form>

          <ul>
            {blog.comments?.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default Blog
