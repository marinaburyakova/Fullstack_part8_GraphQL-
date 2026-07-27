import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

// Инициализируем клиент Apollo
const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(), // Встроенное кэширование для ускорения работы
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Оборачиваем приложение в провайдер */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)
