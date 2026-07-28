import { useState } from 'react'
import { useQuery } from '@apollo/client/react/index.js'
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const { loading, error, data } = useQuery(ALL_BOOKS)

  if (!show) return null
  if (loading) return <div style={{ padding: '10px' }}>loading books...</div>
  if (error) return <div style={{ color: 'red', padding: '10px' }}>Error loading books: {error.message}</div>

  // Собираем массив уникальных жанров изо всех книг в базе данных для генерации кнопок
  const allGenres = [...new Set(data.allBooks.flatMap(b => b.genres || []))]

  // Фильтруем книги локально на основе выбранного жанра
  const booksToShow = selectedGenre
    ? data.allBooks.filter(b => b.genres.includes(selectedGenre))
    : data.allBooks

  return (
    <div>
      <h2>books</h2>
      
      {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT: Индикатор текущего жанра */}
      {selectedGenre && (
        <p>in genre <strong>{selectedGenre}</strong></p>
      )}

      <table style={{ textAlign: 'left', width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>title</th>
            <th style={{ padding: '8px' }}>author</th>
            <th style={{ padding: '8px' }}>published</th>
          </tr>
        </thead>
        <tbody>
          {booksToShow.map((b) => (
            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{b.title}</td>
              <td style={{ padding: '8px' }}>{b.author?.name || b.author}</td>
              <td style={{ padding: '8px' }}>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT (Строки 137-147): Кнопки фильтрации жанров */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '15px' }}>
        {allGenres.map(genre => (
          <button 
            key={genre} 
            onClick={() => setSelectedGenre(genre)}
            style={{ 
              backgroundColor: selectedGenre === genre ? '#007bff' : '#fff',
              color: selectedGenre === genre ? '#fff' : '#495057'
            }}
          >
            {genre}
          </button>
        ))}
        <button 
          onClick={() => setSelectedGenre(null)}
          style={{ backgroundColor: !selectedGenre ? '#6c757d' : '#fff', color: !selectedGenre ? '#fff' : '#495057' }}
        >
          all genres
        </button>
      </div>
    </div>
  )
}

export default Books
