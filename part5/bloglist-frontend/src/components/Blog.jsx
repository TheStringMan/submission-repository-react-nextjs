import { useState } from 'react'

const Blog = ({ blog, updateLikes, deleteBlog, user }) => {
  const [visibleBlog, setVisibleBlog] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle}>

      {visibleBlog ? (
        <div>
          <div>
            {blog.title} <button onClick={() => setVisibleBlog(false)}>hide</button>
          </div>
          <div>
            {blog.url}
          </div>
          <div>
            {blog.likes} likes <button onClick={() => updateLikes(blog.id)}>like</button>
          </div>
          <div>
            {blog.author}
          </div>

          {blog.user?.username === user.username && (
            <button onClick={() => deleteBlog(blog)}>remove</button>
          )}
        </div>
      ) : (
        <div>
          <div>
            {blog.title} by {blog.author} <button onClick={() => setVisibleBlog(true)}>view</button>
          </div>
        </div>
      )}

    </div>
  )
}


export default Blog