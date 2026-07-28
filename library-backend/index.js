
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

import Author from './models/author.js'
import Book from './models/book.js'
import User from './models/user.js'
import { GraphQLError } from 'graphql'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for Subscriptions (˶ᵔ ᵕ ᵔ˶)'))
  .catch((error) => console.log('Error:', error.message))

const typeDefs = `#graphql
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    login(username: String!): Token
  }

  # НОВОЕ (Задание 8.23): Точка входа для прослушивания событий в реальном времени
  type Subscription {
    bookAdded: Book!
  }
`

// Создаем специальный итератор для публикации событий
import { PubSub } from 'graphql-subscriptions'
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = {}
      if (args.genre) query.genres = args.genre
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) query.author = author._id
        else return []
      }
      return Book.find(query).populate('author')
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => Book.find({ author: root._id }).countDocuments(),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Author failed: ' + error.message, {
            extensions: { code: 'BAD_USER_INPUT' },
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Book failed: ' + error.message, {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const populatedBook = await book.populate('author')

      // НОВОЕ (Задание 8.24): Публикуем событие "КНИГА_ДОБАВЛЕНА" в WebSocket-канал
      pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })

      return populatedBook
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      return author.save()
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.username !== 'marina') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      return {
        value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET),
      }
    },
  },

  // НОВОЕ (Задание 8.23): Резолвер подписки, связывающий триггер и WebSocket
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

// Запуск сложной структуры Express + HTTP Server + WebSockets
const app = express()
const httpServer = http.createServer(app)

const schema = makeExecutableSchema({ typeDefs, resolvers })

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
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

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
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

const PORT = 4000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
})