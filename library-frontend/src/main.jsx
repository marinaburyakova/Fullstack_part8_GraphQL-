import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react/index.js'
import { setContext } from '@apollo/client/link/context/index.js' // Импорт контекста

const httpLink = new HttpLink({
  uri: 'http://localhost:4000',
})

// Настраиваем middleware для автоматической подстановки токена (Задание 8.20)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('library-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

const client = new ApolloClient({
  // Склеиваем ссылку авторизации и HTTP-ссылку вместе
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)
