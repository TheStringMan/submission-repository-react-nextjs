import { useState } from 'react'

const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>

const MaxAnecdote = ({votes, anecdotes}) => {
  const indexOfMax = () => {
    return votes.reduce((maxIndex, elem, i, votes) => elem > votes[maxIndex] ? i : maxIndex, 0)
  }

  if(votes.every(item => item === 0))
  {
    return (
      <div></div>
    )
  }
  else
  {
    return (
      <div>
        <h1>Anecdote with most votes</h1>
        <p>{anecdotes[indexOfMax()]}</p>
      </div>
    )
  }
}

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(Array(8).fill(0))

  const vote = () => {
    const copy = [...votes]
    // increment the value in position by one
    copy[selected] += 1  
    setVotes(copy)
  }

  return (
    <div>
      <p>{anecdotes[selected]}</p>
      <Button onClick={() => setSelected(Math.floor(Math.random()*anecdotes.length))} text="Next anecdote" />
        <p>Has {votes[selected]} votes</p>
      <Button onClick={() => vote()} text="Vote" />
      <MaxAnecdote votes={votes} anecdotes={anecdotes}/>
    </div>
  )
}

export default App