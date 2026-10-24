import { Link } from 'react-router-dom'
import { useUsers } from '../hooks/useUsers'

const Users = () => {
  const result = useUsers()
  if (result.isLoading) return <div>Loading...</div>
  const users = result.data ?? []

  return (
    <>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>-{' '}
            {user.blogs.length} blogs
          </li>
        ))}
      </ul>
    </>
  )
}

export default Users
