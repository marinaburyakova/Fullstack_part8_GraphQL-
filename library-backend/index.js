import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { useServer } from 'graphql-ws/use/ws'
import { WebSocketServer } from 'ws'
import express from 'express'
import http from 'http'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import User from './models/user.js'
import typeDefs from './schema.js'     // Нативный ESM импорт схемы
import resolvers from './resolvers.js' // Нативный ESM импорт резолверов

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

// Всегда подключаемся к базе данных. Если URI передан извне тестами, используем его,
// иначе берем стандартную локальную строку подключения из файла .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/graphqlLibrary'

console.log('Connecting to MongoDB database...', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully (˶ᵔ ᵕ ᵔ˶)')
  })
  .catch((error) => {
    console.log('Error connection to MongoDB:', error.message)
  })

const app = express()
const httpServer = http.createServer(app)

// ИСПРАВЛЕНО ДЛЯ ИСКЛЮЧЕНИЯ ОШИБКИ REQ.BODY:
// Подключаем глобальные middleware на самый верх Express-приложения.
// Теперь тело любого входящего запроса парсится ДО обращения к Apollo Server!
app.use(cors())
app.use(express.json())

// Собираем исполняемую схему GraphQL
const schema = makeExecutableSchema({ typeDefs, resolvers })

// Настраиваем изолированный WebSocket сервер для обработки Subscriptions
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    // Корректное закрытие HTTP-сервера
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Корректное закрытие WebSocket-соединений при остановке
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()

// ИСПРАВЛЕНО: Передаем в expressMiddleware только сам сервер и контекст,
// так как CORS и JSON-парсер уже отработали на верхнем уровне приложения!
app.use(
  '/graphql',
  expressMiddleware(server, {
    // Контекст авторизации: проверяет токен перед каждым вызовом Query/Mutation
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.startsWith('Bearer ')) {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      }
    },
  }),
)

// Сначала проверяем динамический порт от тестов/хостинга, 
// и только если его нет — берем 4000 по умолчанию
const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL Production Server ready on port ${PORT}`)
})
