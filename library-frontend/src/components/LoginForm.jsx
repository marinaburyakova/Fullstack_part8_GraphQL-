import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react/index.js'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      alert(error.graphQLErrors[0]?.message || 'Login failed')
    }
  })

  // Следим за результатом мутации: как только токен прилетит, сохраняем его
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      setPage('authors') // Перенаправляем на вкладку авторов
    }
  }, [result.data, setToken, setPage])

  if (!show) return null

  const submit = (event) => {
    event.preventDefault()
    if (!username) return
    login({ variables: { username } })
    setUsername('')
  }

  return (
    <div style={{ maxWidth: '300px', marginTop: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>login</button>
      </form>
    </div>
  )
}

export default LoginForm
