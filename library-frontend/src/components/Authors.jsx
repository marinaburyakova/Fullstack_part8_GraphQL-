import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react/index.js'
import { ALL_AUTHORS, EDIT_BORN } from '../queries'

const Authors = ({ show }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  // 1. Делаем GraphQL-запрос на получение авторов
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  
  // 2. Объявляем мутацию изменения года рождения
  const [changeBorn] = useMutation(EDIT_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  if (!show) return null
  if (loading) return <div style={{ padding: '10px' }}>loading authors...</div>
  if (error) return <div style={{ color: 'red', padding: '10px' }}>Error: {error.message}</div>

  const submit = (event) => {
    event.preventDefault()
    
    // ИСПРАВЛЕНО (React 19): Если пользователь не трогал select, 
    // берем имя самого первого автора из массива данных сервера
    const selectedName = name || (data?.allAuthors?.[0]?.name)

    if (!selectedName || !born) return

    changeBorn({ 
      variables: { 
        name: selectedName, 
        setBornTo: Number(born) 
      } 
    })

    setBorn('')
    setName('') // Сбрасываем выбранное имя для следующего раза
  }

  return (
    <div>
      <h2>authors</h2>
      <table style={{ textAlign: 'left', width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>name</th>
            <th style={{ padding: '8px' }}>born</th>
            <th style={{ padding: '8px' }}>books</th>
          </tr>
        </thead>
        <tbody>
          {data.allAuthors.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{a.name}</td>
              <td style={{ padding: '8px' }}>{a.born || '-'}</td>
              <td style={{ padding: '8px' }}>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submit} style={{ maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '80px' }}>name</label>
          <select 
            value={name} 
            onChange={({ target }) => setName(target.value)}
            style={{ flex: 1, padding: '5px' }}
          >
            {/* ИСПРАВЛЕНО: Добавляем пустую подсказку-опцию по умолчанию */}
            <option value="">-- select author --</option>
            {data.allAuthors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '80px' }}>born</label>
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        <button 
          type="submit" 
          style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          update author
        </button>
      </form>
    </div>
  )
}

export default Authors
