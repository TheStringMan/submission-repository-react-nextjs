import { ALL_BOOKS, ME } from '../queries'
import { useQuery } from '@apollo/client/react'

const Recommendations = (props) => {
  const resultBooks = useQuery(ALL_BOOKS)
  const resultUser = useQuery(ME)

  if (!props.show) {
    return null
  }

  if (resultUser.loading || resultBooks.loading) {
    return <div>loading...</div>
  }
  const books = resultBooks.data.allBooks
  const favoriteGenre = resultUser.data.me.favoriteGenre
  const booksToShow = favoriteGenre
    ? books.filter((b) => b.genres.includes(favoriteGenre))
    : books

  return (
    <div>
      <h2>Recommendations</h2>

      <h5>Books in your favourite genre {favoriteGenre}</h5>

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

export default Recommendations
