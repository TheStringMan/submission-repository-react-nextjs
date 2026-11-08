import { ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const allBooksResult = useQuery(ALL_BOOKS) // per i bottoni: sempre tutti i generi
  const filteredResult = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
  }) // per la tabella: cambia col filtro

  if (!props.show) {
    return null
  }

  if (allBooksResult.loading || filteredResult.loading) {
    return <div>loading...</div>
  }
  const books = allBooksResult.data.allBooks
  const booksToShow = filteredResult.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <h5>in genre {selectedGenre}</h5>

      {[...new Set(books.flatMap((b) => b.genres))].map((g) => (
        <button key={g} onClick={() => setSelectedGenre(g)}>
          {g}
        </button>
      ))}
      <button onClick={() => setSelectedGenre(null)}>all genres</button>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
