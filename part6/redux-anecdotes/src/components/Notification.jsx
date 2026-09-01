import { useSelector } from 'react-redux'

const Notification = () => {
  const notification = useSelector(state => state.notification)

  if (!notification) return null  // niente da mostrare
  return (
    <div style={{ border: 'solid', padding: 10, borderWidth: 1 }}>
      {notification}
    </div>
  )
}

export default Notification