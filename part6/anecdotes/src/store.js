
import { create } from 'zustand'
import anecdoteService from './services/anecdotes'
import useNotificationStore from './notificationStore'

const useAnecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',
  actions: {
    vote: async (id) => {
      const anecdote = get().anecdotes.find(n => n.id === id)
      const updated = await anecdoteService.update(
        id, { ...anecdote, votes: anecdote.votes + 1 }
      )
      set(state => ({
        anecdotes: state.anecdotes.map(n => n.id === id ? updated : n)
      }))
      useNotificationStore.getState().actions.setNotification(`you voted '${updated.content}'`)
    },
    addAnecdote: async (content) => {
      const newAnecdote = await anecdoteService.createNew(content)
      set(state => ({ anecdotes: state.anecdotes.concat(newAnecdote) }))
      useNotificationStore.getState().actions.setNotification(`you created '${newAnecdote.content}'`)
    },
    setFilter: (filter) => set({ filter }),
    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set(() => ({ anecdotes }))
    },
    deleteAnecdote: async (id) => {
      await anecdoteService.deleteAnecdote(id)
      set(state => ({
        anecdotes: state.anecdotes.filter(n => n.id !== id)
      }))
      useNotificationStore.getState().actions.setNotification(`you deleted an anecdote`)
    }
  }
}))

export default useAnecdoteStore
export const useAnecdotes = () => {
  const anecdotes = useAnecdoteStore((state) => state.anecdotes)
  const filter = useAnecdoteStore((state) => state.filter)

  return anecdotes.filter(a => a.content.includes(filter)).toSorted((a, b) => b.votes - a.votes)
}
export const useFilter = () => useAnecdoteStore((state) => state.filter)
export const useAnecdoteActions = () => useAnecdoteStore((state) => state.actions)
