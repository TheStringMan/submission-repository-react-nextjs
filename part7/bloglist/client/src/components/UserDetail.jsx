import { useUsers } from '../hooks/useUsers'
import { useMatch } from 'react-router-dom'

const UserDetail = () => {
  const result = useUsers()
  const match = useMatch('/users/:id')

  if (result.isLoading) return <div>Loading...</div>
  const users = result.data ?? []

  const user = match ? users.find((u) => u.id === match.params.id) : null

  return (
    <>
      {user && (
        <div className="user">
          <h2>{user.name}</h2>
          <h3>added blogs</h3>
          <ul>
            {user.blogs.map((blog) => (
              <li key={blog.id}>{blog.title}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default UserDetail
