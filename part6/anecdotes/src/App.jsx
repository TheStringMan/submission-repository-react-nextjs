import { useEffect } from 'react'
import { useAnecdoteActions } from "./store";
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import AnecdoteFilter from './components/Filter'
import Notification from './components/Notification'

const App = () => {
const { initialize } = useAnecdoteActions()
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div>
      <Notification />
      <AnecdoteFilter />

      <h2>Anecdotes</h2>
      <AnecdoteList />
      <AnecdoteForm />
    </div>
  )
}

export default App