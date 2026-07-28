import { useQuery } from '@apollo/client/react/index.js'
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  // Выполняем GraphQL-запрос на получение всех книг
  const { loading, error, data } = useQuery(ALL_BOOKS)

  // Если вкладка в меню не активна, компонент ничего не рисует на экране
  if (!show) return null

  // Обработка состояний жизненного цикла запроса Apollo Client
  if (loading) return <div style={{ padding: '10px' }}>loading books...</div>
  if (error) return <div style={{ color: 'red', padding: '10px' }}>Error loading books: {error.message}</div>

  return (
    <div>
      <h2>books</h2>

      <table style={{ textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>title</th>
            <th style={{ padding: '8px' }}>author</th>
            <th style={{ padding: '8px' }}>published</th>
          </tr>
        </thead>
        <tbody>
          {data.allBooks.map((b) => (
            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{b.title}</td>
              <td style={{ padding: '8px' }}>{b.author.name || b.author}</td>
              <td style={{ padding: '8px' }}>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
