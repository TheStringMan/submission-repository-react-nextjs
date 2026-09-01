import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

const anecdoteSlice = createSlice({
  name: 'anectodes',
  initialState: [],
  reducers: {
    voteAnecdote(state, action) {
      const id = action.payload
      return state.map(anecdote =>
        anecdote.id === id
          ? { ...anecdote, votes: anecdote.votes + 1 }
          : anecdote
      )
    },
    appendAnecdote(state, action) {
      state.push(action.payload)
    },
    setAnecdotes(state, action) {
      return action.payload
    }
  },
})

export const initializeAnecdotes = () => {
  return async dispatch => {
    const anecdotes = await anecdoteService.getAll()
    dispatch(setAnecdotes(anecdotes))
  }
}

export const createAnecdote = content => {
  return async dispatch => {
    const newAnecdote = await anecdoteService.createNew(content)
    dispatch(appendAnecdote(newAnecdote))
  }
}

export const { voteAnecdote, setAnecdotes, appendAnecdote } = anecdoteSlice.actions
export default anecdoteSlice.reducer