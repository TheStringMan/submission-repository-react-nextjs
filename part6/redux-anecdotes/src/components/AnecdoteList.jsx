import { useDispatch, useSelector } from 'react-redux'
import { voteAnecdote } from '../reducers/anecdoteReducer'
import { setNotification } from '../reducers/notificationReducer'

const Anecdote = ({ anecdote, handleClick }) => {
  return (
    <div>
      <div>{anecdote.content}</div>
      <div>
        has {anecdote.votes} votes
        <button onClick={handleClick}>vote</button>
      </div>
    </div>
  )
}

const AnecdoteList = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(state => {
    return state.anecdotes
      .filter(a => a.content.toLowerCase().includes(state.filter.toLowerCase()))
      .sort((a, b) => b.votes - a.votes)
  })

  const handleVote  = (id) => {
    const anecdote = anecdotes.find(a => a.id === id)
    dispatch(setNotification(`You voted '${anecdote.content}'`, 5))
    dispatch(voteAnecdote(id))
  }

  return (
    <>
      {anecdotes.map(anecdote =>
        <Anecdote
          key={anecdote.id}
          anecdote={anecdote}
          handleClick={() =>
            handleVote (anecdote.id)
          }
        />
      )}
    </>
  )
}

export default AnecdoteList
