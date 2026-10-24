import blogService from '../services/blogs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../NotificationContext'

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
  })
}

export const useCreateBlog = () => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return useMutation({
    mutationFn: blogService.create,
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setNotification(
        `A new blog ${blog.title} by ${blog.author} added`,
        'success',
      )
    },
    onError: (error) => {
      setNotification(error.response.data.error, 'error')
    },
  })
}

export const useUpdateBlog = () => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return useMutation({
    mutationFn: ({ id, blog }) => blogService.update(id, blog),
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setNotification(`Blog ${blog.title} updated`, 'success')
    },
    onError: (error) => {
      setNotification(error.response.data.error, 'error')
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

    return useMutation({
    mutationFn: ({ id }) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
        setNotification(`Blog deleted`, 'success')
    },
    onError: (error) => {
      setNotification(error.response.data.error, 'error')
    },
  })
}

export const useAddComment = () => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return useMutation({
    mutationFn: ({ id, comment }) => blogService.addComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setNotification(`Comment added`, 'success')
    },
    onError: (error) => {
      setNotification(error.response.data.error, 'error')
    },
  })
}