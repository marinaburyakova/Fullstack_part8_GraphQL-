import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ApolloClient, InMemoryCache, HttpLink, split, from } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react/index.js'
import { setContext } from '@apollo/client/link/context/index.js'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

// 1. Обычный HTTP линк
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' })

// 2. Middleware авторизации
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('library-user-token')
  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : null }
  }
})

// 3. Новый WebSocket линк протокола ws:// (Задание 8.23)
const wsLink = new GraphQLWsLink(
  createClient({ url: 'ws://localhost:4000/graphql' })
)

// 4. Склеиваем ссылки: split() автоматически определяет тип операции
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,                 // Если подписка — отправляем в веб-сокет
  from([authLink, httpLink]) // Если запрос — отправляем по HTTP с токеном
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)
