import { useState} from 'react'
import { useApolloClient } from '@apollo/client/react/index.js'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations' // Импорт

const App = () => {
  const [page, setPage] = useState('authors')
  // ИСПРАВЛЕНО: Читаем localStorage прямо на старте, эффект больше не нужен
  const [token, setToken] = useState(() =>
    localStorage.getItem('library-user-token'),
  )

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore() // Очищаем кэш Apollo, чтобы данные прошлого юзера стерлись
    setPage('authors')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {/* Условное меню навигации в зависимости от токена (Задание 8.18) */}
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                borderColor: '#dc3545',
              }}
            >
              logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setPage('login')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              borderColor: '#28a745',
            }}
          >
            login
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Authors show={page === 'authors'} />
        <Books show={page === 'books'} />
        <NewBook show={page === 'add'} />
        <Recommendations show={page === 'recommend'} />
        <LoginForm
          show={page === 'login'}
          setToken={setToken}
          setPage={setPage}
        />
      </div>
    </div>
  )
}

export default App
