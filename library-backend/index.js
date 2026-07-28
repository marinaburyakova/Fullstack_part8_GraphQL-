import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

import Author from './models/author.js'
import Book from './models/book.js'
import User from './models/user.js' // Импорт модели юзера

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB (˶ᵔ ᵕ ᵔ˶)'))
  .catch((error) => console.log('error connection:', error.message))

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

  # НОВОЕ: Тип пользователя (Задание 8.19)
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  # НОВОЕ: Тип токена для авторизации
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User # НОВОЕ: Запрос профиля текущего юзера (Задание 8.19)
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    # НОВОЕ: Мутация входа (Задание 8.18)
    login(
      username: String!
    ): Token
  }
`

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
    
    // Резолвер профиля возвращает юзера из контекста (Задание 8.19)
    me: (root, args, context) => context.currentUser
  },

  Author: {
    bookCount: async (root) => Book.find({ author: root._id }).countDocuments()
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      // Задание 8.20: Защита роута. Если юзер не залогинен, выкидываем ошибку
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed: ' + error.message, { extensions: { code: 'BAD_USER_INPUT' } })
        }
      }

      const book = new Book({ ...args, author: author._id })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed: ' + error.message, { extensions: { code: 'BAD_USER_INPUT' } })
      }

      return book.populate('author')
    },

    editAuthor: async (root, args, context) => {
      // Задание 8.20: Защита изменения года рождения
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', { extensions: { code: 'BAD_USER_INPUT' } })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) return null

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw new GraphQLError('Updating author failed: ' + error.message, { extensions: { code: 'BAD_USER_INPUT' } })
      }
    },

    // Мутация авторизации (Задание 8.18)
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      // В рамках упрощения задания курса пароль не проверяется, только username
      if (!user || args.username !== 'marina') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      // Генерируем JWT токен
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// НастраиваемStandalone Server с перехватом токенов в контекст
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

console.log(`🚀 GraphQL Server with Auth ready at ${url}`)
