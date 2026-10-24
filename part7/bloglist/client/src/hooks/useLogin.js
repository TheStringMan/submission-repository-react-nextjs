import loginService from '../services/login'
import blogService from '../services/blogs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '../UserContext'
import { useNotification } from '../NotificationContext'

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { loginUser } = useUser()
  const { setNotification } = useNotification()

  return useMutation({
    mutationFn: (credentials) => loginService.login(credentials),
    onSuccess: (user) => {
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      loginUser(user)
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setNotification(`Welcome ${user.name}`, 'success')
    },
    onError: (error) => {
      setNotification(error.response.data.error, 'error')
    },
  })
}
