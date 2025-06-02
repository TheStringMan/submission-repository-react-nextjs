import { useState } from 'react'

const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>

const Feedback = ({good, bad, neutral}) => {
  if (good+bad+neutral == 0) {
    return (
      <div>
        nessuna statistica salvata
      </div>
    )
  }
  else {
  return (
    <div>
      <h1>Statistics</h1>

      <table>
        <tbody>
          <tr>
            <td>Good</td>
            <td>{good}</td>
          </tr>

          <tr>
            <td>Neutral</td>
            <td>{neutral}</td>
          </tr>

          <tr>
            <td>Bad</td>
            <td>{bad}</td>
          </tr>

          <tr>
            <td>All</td>
            <td>{good + neutral + bad}</td>
          </tr>

          <tr>
            <td>Positive</td>
            <td>{(good * 100 )/(good + neutral + bad)}</td>
          </tr>
        </tbody>
      </table>
      
    </div>
  )
  }
}

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>Give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text="Good" />
      <Button onClick={() => setNeutral(neutral + 1)} text="Neutral" />
      <Button onClick={() => setBad(bad + 1)} text="Bad" />
      <Feedback good={good} bad={bad} neutral={neutral}></Feedback>
    </div>
  )
}

export default App