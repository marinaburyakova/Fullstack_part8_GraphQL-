import { ApolloServer } from '@apollo/server'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from '../library-backend/node_modules/mongoose/index.js'

// Важно: Импортируем типы и резолверы
import typeDefs from '../library-backend/schema.js'
import resolvers from '../library-backend/resolvers.js'

let mongoServer

export const setupDatabase = async () => {
  // Закрываем любые случайные старые соединения
  await mongoose.disconnect()
  
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  
  // Жестко отключаем буферизацию, чтобы Mongoose сразу выдавал ошибку, а не висел 10 секунд
  mongoose.set('bufferCommands', false)
  
  await mongoose.connect(uri)
}

export const teardownDatabase = async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}

export const seedDatabase = async () => {
  // Динамически импортируем модели СТРОГО после того, как соединение установлено
  const { default: Author } = await import('../library-backend/models/author.js')
  const { default: Book } = await import('../library-backend/models/book.js')
  const { default: User } = await import('../library-backend/models/user.js')

  await Author.deleteMany({})
  await Book.deleteMany({})
  await User.deleteMany({})

  const author = new Author({ name: 'Robert Martin', born: 1952 })
  await author.save()

  const book = new Book({
    title: 'Clean Code',
    published: 2008,
    author: author._id,
    genres: ['refactoring']
  })
  await book.save()
}

export const createServer = () => {
  return new ApolloServer({ typeDefs, resolvers })
}
