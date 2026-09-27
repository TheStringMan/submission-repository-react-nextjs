import { useNavigate } from 'react-router-dom'

const Blog = ({ blog, updateLikes, deleteBlog, isOwner, user }) => {
  const navigate = useNavigate()

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
        </div>
      )}
    </>
  )
}

export default Blog
