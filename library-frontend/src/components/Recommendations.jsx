import { useQuery } from '@apollo/client/react/index.js'
import { USER_ME, ALL_BOOKS_BY_GENRE } from '../queries'

const Recommendations = ({ show }) => {
  // 1. Запрашиваем профиль текущего пользователя
  const userResult = useQuery(USER_ME, {
    skip: !show // Запрос не полетит, если вкладка закрыта
  })

  const favoriteGenre = userResult.data?.me?.favoriteGenre

  // 2. Запрашиваем книги только любимого жанра
  const booksResult = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre // Ждем, пока определится жанр
  })

  if (!show) return null

  if (userResult.loading || booksResult.loading) {
    return <div>loading recommendations...</div>
  }

  const books = booksResult.data?.allBooks || []

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre <strong>{favoriteGenre}</strong></p>

      {books.length === 0 ? (
        <p style={{ italic: 'true', color: '#666' }}>No books found in this genre yet.</p>
      ) : (
        <table style={{ textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>title</th>
              <th>author</th>
              <th>published</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Recommendations
