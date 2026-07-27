import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS } from '../queries'

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  // Объявляем мутацию создания книги (Задание 8.10)
  // Принудительно заставляем Apollo перечитать списки книг и авторов с сервера
  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  if (!show) return null

  const submit = async (event) => {
    event.preventDefault()

    if (!title || !author || !published) return

    // Передаем переменные в GraphQL-мутацию
    createBook({
      variables: { 
        title, 
        author, 
        published: Number(published), 
        genres 
      }
    })

    // Полностью очищаем все поля формы
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    if (genre.trim() !== '') {
      setGenres(genres.concat(genre.trim()))
      setGenre('')
    }
  }

  return (
    <div>
      <form onSubmit={submit} style={{ maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '80px' }}>title</label>
          <input 
            value={title} 
            onChange={({ target }) => setTitle(target.value)} 
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '80px' }}>author</label>
          <input 
            value={author} 
            onChange={({ target }) => setAuthor(target.value)} 
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '80px' }}>published</label>
          <input 
            type="number" 
            value={published} 
            onChange={({ target }) => setPublished(target.value)} 
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <input 
            value={genre} 
            onChange={({ target }) => setGenre(target.value)} 
            style={{ flex: 1, padding: '5px' }}
          />
          <button onClick={addGenre} type="button" style={{ padding: '5px' }}>
            add genre
          </button>
        </div>
        <div style={{ textTransform: 'lowercase', color: '#666', fontSize: '14px' }}>
          genres: {genres.join(', ')}
        </div>
        <button 
          type="submit" 
          style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          create book
        </button>
      </form>
    </div>
  )
}

export default NewBook
