import { useNavigate } from "react-router"
import  { useField, useAnecdotes } from '../hooks'

const CreateNew = () => {
  const contentField = useField('text')
  const authorField = useField('text')
  const infoField = useField('text')
  const { reset: resetField, ...contentProps } = contentField
  const { reset: resetAuthor, ...authorProps } = authorField
  const { reset: resetInfo, ...infoProps } = infoField
  const navigate = useNavigate()
  const { addAnecdote } = useAnecdotes()

  const handleSubmit = (e) => {
    e.preventDefault()
    addAnecdote({ content: contentField.value, author: authorField.value, info: infoField.value, votes: 0 })
    navigate("/")
  }

  const handleReset = (e) => {
    e.preventDefault()
    resetField()
    resetAuthor()
    resetInfo()
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input {...contentProps} />
        </div>
        <div>
          author
          <input {...authorProps} />
        </div>
        <div>
          url for more info
          <input {...infoProps} />
        </div>
        <button>create</button>
        <button type="button" onClick={handleReset}>
          reset
        </button>
      </form>
    </div>
  )
}

export default CreateNew
