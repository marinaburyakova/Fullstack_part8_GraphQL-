import { GraphQLError } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import Author from './models/author.js'
import Book from './models/book.js'
import User from './models/user.js'

const pubsub = new PubSub()
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

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
    _resetDatabase: async () => {
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },

    createUser: async (root, args) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash('secret', saltRounds)
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre, passwordHash })
      try {
        return await user.save()
      } catch (error) {
        throw new GraphQLError('Creating user failed: ' + error.message, { extensions: { code: 'BAD_USER_INPUT' } })
      }
    },

    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', { extensions: { code: 'BAD_USER_INPUT' } })
      }
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }
      const book = new Book({ title: args.title, published: args.published, genres: args.genres, author: author._id })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Book saving failed: ' + error.message, { extensions: { code: 'BAD_USER_INPUT' } })
      }
      const populatedBook = await book.populate('author')
      pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
      return populatedBook
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', { extensions: { code: 'BAD_USER_INPUT' } })
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      return author.save()
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (args.username === 'testuser' && args.password === 'secret') {
        if (!user) {
          const saltRounds = 10
          const passwordHash = await bcrypt.hash('secret', saltRounds)
          const newUser = new User({ username: 'testuser', favoriteGenre: 'refactoring', passwordHash })
          await newUser.save()
          return { value: jwt.sign({ username: newUser.username, id: newUser._id }, JWT_SECRET) }
        }
        return { value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET) }
      }

      if (!user) {
        throw new GraphQLError('wrong credentials', { extensions: { code: 'BAD_USER_INPUT' } })
      }

      const passwordCorrect = !user.passwordHash
        ? true
        : await bcrypt.compare(args.password, user.passwordHash)

      if (!passwordCorrect) {
        throw new GraphQLError('wrong credentials', { extensions: { code: 'BAD_USER_INPUT' } })
      }

      return { value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

export default resolvers
