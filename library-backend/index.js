import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

// Исходный массив авторов (Задание 8.1)
let authors = [
  { name: 'Robert Martin', id: "fda1b5d0-31e4-11e9-a297-d4f547e7b13c", born: 1952 },
  { name: 'Martin Fowler', id: "fda1b5d1-31e4-11e9-a297-d4f547e7b13c", born: 1963 },
  { name: 'Fyodor Dostoevsky', id: "fda1b5d2-31e4-11e9-a297-d4f547e7b13c", born: 1821 },
  { name: 'Joshua Bloch', id: "fda1b5d3-31e4-11e9-a297-d4f547e7b13c", born: 1961 },
  { name: 'Sandi Metz', id: "fda1b5d4-31e4-11e9-a297-d4f547e7b13c", born: 1956 }
]

// Исходный массив книг (Задание 8.1)
let books = [
  { title: 'Clean Code', published: 2008, author: 'Robert Martin', id: "ffa1b5d0-31e4-11e9-a297-d4f547e7b13c", genres: ['refactoring'] },
  { title: 'Agile Software Development', published: 2002, author: 'Robert Martin', id: "ffa1b5d1-31e4-11e9-a297-d4f547e7b13c", genres: ['agile', 'patterns', 'design'] },
  { title: 'Refactoring', published: 1999, author: 'Martin Fowler', id: "ffa1b5d2-31e4-11e9-a297-d4f547e7b13c", genres: ['refactoring'] },
  { title: 'Patterns of Enterprise Application Architecture', published: 2003, author: 'Martin Fowler', id: "ffa1b5d3-31e4-11e9-a297-d4f547e7b13c", genres: ['patterns'] },
  { title: 'Crime and Punishment', published: 1866, author: 'Fyodor Dostoevsky', id: "ffa1b5d4-31e4-11e9-a297-d4f547e7b13c", genres: ['classic', 'crime'] },
  { title: 'The Demons', published: 1872, author: 'Fyodor Dostoevsky', id: "ffa1b5d5-31e4-11e9-a297-d4f547e7b13c", genres: ['classic', 'revolution'] }
]

// 1. Описание Схемы данных GraphQL (typeDefs)
const typeDefs = `#graphql
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int! # Задание 8.3: Вычисляемое динамическое поле
  }

  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!
  }

  # Описание всех доступных запросов на чтение (Queries)
  type Query {
    bookCount: Int!      # Задание 8.1
    authorCount: Int!    # Задание 8.1
    allBooks(author: String, genre: String): [Book!]! # Задание 8.2 (с фильтрами)
    allAuthors: [Author!]! # Задание 8.3
  }

  # Описание всех доступных запросов на изменение данных (Mutations)
  type Mutation {
    # Задание 8.4, 8.5: Добавление новой книги
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

    # Задание 8.6, 8.7: Редактирование года рождения автора
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

// 2. Логика обработки запросов (Resolvers)
const resolvers = {
  Query: {
    // Возвращает общее количество книг (Задание 8.1)
    bookCount: () => books.length,
    
    // Возвращает общее количество авторов (Задание 8.1)
    authorCount: () => authors.length,
    
    // Возвращает книги с возможностью фильтрации по автору и/или жанру (Задание 8.2)
    allBooks: (root, args) => {
      let filteredBooks = books
      
      if (args.author) {
        filteredBooks = filteredBooks.filter(b => b.author === args.author)
      }
      
      if (args.genre) {
        filteredBooks = filteredBooks.filter(b => b.genres.includes(args.genre))
      }
      
      return filteredBooks
    },

    // Возвращает массив всех авторов (Задание 8.3)
    allAuthors: () => authors
  },

  // Кастомный резолвер для подсчета количества книг конкретного автора (Задание 8.3)
  Author: {
    bookCount: (root) => {
      return books.filter(b => b.author === root.name).length
    }
  },

  Mutation: {
    // Добавление новой книги (Задание 8.4) + авто-создание автора, если его нет (Задание 8.5)
    addBook: (root, args) => {
      const authorExists = authors.find(a => a.name === args.author)
      
      if (!authorExists) {
        // Если автора с таким именем нет в массиве, регистрируем его (Задание 8.5)
        const newAuthor = { 
          name: args.author, 
          id: (100000 * Math.random()).toFixed(0) 
        }
        authors = authors.concat(newAuthor)
      }

      // Создаем и сохраняем саму книгу
      const newBook = { 
        ...args, 
        id: (100000 * Math.random()).toFixed(0) 
      }
      books = books.concat(newBook)
      return newBook
    },

    // Редактирование года рождения автора (Задание 8.6)
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      
      if (!author) {
        return null // Задание 8.7: Если автор не найден, по спецификации возвращаем null
      }

      const updatedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
    }
  }
}

// 3. Конфигурация и запуск Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// Запускаем сервер изолированно на стандартном порту 4000
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

