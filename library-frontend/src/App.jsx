import { useState, useEffect } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react/index.js'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS } from './queries'
import { updateCache } from './updateCache'

const App = () => {
  const [page, setPage] = useState('authors')
  // Ленивая инициализация стейта токена, исключающая каскадные рендеринги в React 19
  const [token, setToken] = useState(() => localStorage.getItem('library-user-token'))
  const client = useApolloClient()

  // Прослушивание подписок GraphQL Subscriptions по WebSocket в реальном времени (Задание 8.24)
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      alert(`🎉 New book alert! "${addedBook.title}" by ${addedBook.author.name} was added!`)
      // Безопасное обновление кэша без дублирования ID (Задание 8.25 - 8.26)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    }
  })

  // Синхронизация сессии в реальном времени при изменении вкладок
  useEffect(() => {
    const currentToken = localStorage.getItem('library-user-token')
    if (currentToken && token !== currentToken) {
      setToken(currentToken)
    }
  }, [page, token])

  // Кастомный хэндлер переключения вкладок, критически важный для строгого режима Playwright
  const handlePageChange = (newPage) => {
    const currentToken = localStorage.getItem('library-user-token')
    setToken(currentToken)
    setPage(newPage)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore() // Очистка кэша магазина для безопасности сессии
    setPage('authors')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Меню навигации с точным совпадением регистров строк для тестов */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => handlePageChange('authors')}>authors</button>
        <button onClick={() => handlePageChange('books')}>books</button>
        
        {token ? (
          <>
            <button onClick={() => handlePageChange('add')}>add book</button>
            <button onClick={() => handlePageChange('recommend')}>recommend</button>
            <button onClick={logout} style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}>logout</button>
          </>
        ) : (
          <button onClick={() => handlePageChange('login')} style={{ backgroundColor: '#28a745', color: 'white', borderColor: '#28a745' }}>login</button>
        )}
      </div>

      {/* Контейнер рендеринга активных вкладок приложения */}
      <div style={{ marginTop: '20px' }}>
        <Authors show={page === 'authors'} />
        <Books show={page === 'books'} />
        <NewBook show={page === 'add'} updateCacheWith={(book) => updateCache(client.cache, { query: ALL_BOOKS }, book)} />
        <Recommendations show={page === 'recommend'} />
        <LoginForm show={page === 'login'} setToken={setToken} setPage={setPage} />
      </div>
    </div>
  )
}

export default App
