import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Импортируем строго разделенные модули ядра и провайдера
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react/index.js'

// Явно создаем сетевое соединение с сервером бэкенда на порту 4000
const link = new HttpLink({
  uri: 'http://localhost:4000',
})

// Инициализируем клиент, передавая созданный линк напрямую
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)
