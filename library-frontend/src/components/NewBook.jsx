import { useState } from 'react'
import { useMutation } from '@apollo/client/react/index.js'
import { CREATE_BOOK } from '../queries'

const NewBook = ({ show, updateCacheWith }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  // Задание 8.26: Ручное обновление кэша вместо refetchQueries
  const [createBook] = useMutation(CREATE_BOOK, {
    update: (cache, response) => {
      if (response.data && response.data.addBook) {
        updateCacheWith(response.data.addBook)
      }
    },
    onError: (error) => {
      alert(error.graphQLErrors?.[0]?.message || error.message || 'Error saving book')
    }
  })

  if (!show) return null

  const submit = async (event) => {
    event.preventDefault()

    if (!title || !author || !published) return

    createBook({ 
      variables: { 
        title, 
        author, 
        published: Number(published), 
        genres 
      } 
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    if (genre.trim()) {
      setGenres(genres.concat(genre.trim()))
      setGenre('')
    }
  }

  return (
    <div style={{ maxWidth: '400px' }}>
      <h2>add book</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT (Строка 107): Связка label + id строго строчными буквами */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="title" style={{ width: '100px' }}>title</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>

        {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT (Строка 108) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="author" style={{ width: '100px' }}>author</label>
          <input
            id="author"
            name="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>

        {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT (Строка 109) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="published" style={{ width: '100px' }}>published</label>
          <input
            id="published"
            name="published"
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>

        {/* КРИТИЧЕСКИ ВАЖНО ДЛЯ PLAYWRIGHT (Метод createBook в хелпере) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="genre" style={{ width: '92px' }}>genre</label>
          <input
            id="genre"
            name="genre"
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>

        <div style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          genres: {genres.join(', ')}
        </div>

        <button type="submit" style={{ marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
          create book
        </button>
      </form>
    </div>
  )
}

export default NewBook
