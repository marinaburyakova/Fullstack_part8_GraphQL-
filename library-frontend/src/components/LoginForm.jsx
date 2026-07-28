import { useState, useEffect } from 'react'
import { useMutation, useApolloClient } from '@apollo/client/react/index.js' // ИСПРАВЛЕНО: Добавлен useApolloClient
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  
  const client = useApolloClient() // ИСПРАВЛЕНО: Инициализируем клиент Apollo

  const [login, result] = useMutation(LOGIN, {
   onCompleted: (data) => {
      if (data && data.login) {
        const token = data.login.value
        localStorage.setItem('library-user-token', token)
        setToken(token)
        client.resetStore().then(() => {
          setPage('books') // Перенаправляем на books
        })
      }
    },

onError: (error) => {
      // ИСПРАВЛЕНО ДЛЯ ТЕСТА PLAYWRIGHT (Строка 84):
      // При абсолютно любой ошибке авторизации принудительно выводим "Login failed"
      console.log('GraphQL Login Error:', error)
      setErrorMessage('Login failed')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      
      // ИСПРАВЛЕНО: Сбрасываем кэш и ПЕРЕНАПРАВЛЯЕМ на страницу 'books'
      client.resetStore().then(() => {
        setPage('books')
      })
    }
  }, [result.data, setToken, setPage, client])

  if (!show) return null

  const submit = (event) => {
    event.preventDefault()
    if (!username) return
    
    setErrorMessage(null)
    login({ variables: { username, password } })
    
    setUsername('')
    setPassword('')
  }

  return (
    <div style={{ maxWidth: '300px', marginTop: '20px' }}>
      <h2>Login</h2>
      
      {errorMessage && (
        <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username">username</label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '4px' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '10px', width: '100%' }}>login</button>
      </form>
    </div>
  )
}

export default LoginForm
