import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

let authors = [
  { name: 'Robert Martin', id: "fda1b5d0-31e4-11e9-a297-d4f547e7b13c", born: 1952 },
  { name: 'Martin Fowler', id: "fda1b5d1-31e4-11e9-a297-d4f547e7b13c", born: 1963 },
  { name: 'Fyodor Dostoevsky', id: "fda1b5d2-31e4-11e9-a297-d4f547e7b13c", born: 1821 },
  { name: 'Joshua Bloch', id: "fda1b5d3-31e4-11e9-a297-d4f547e7b13c", born: 1961 },
  { name: 'Sandi Metz', id: "fda1b5d4-31e4-11e9-a297-d4f547e7b13c", born: 1956 }
]

let books = [
  { title: 'Clean Code', published: 2008, author: 'Robert Martin', id: "ffa1b5d0-31e4-11e9-a297-d4f547e7b13c", genres: ['refactoring'] },
  { title: 'Agile Software Development', published: 2002, author: 'Robert Martin', id: "ffa1b5d1-31e4-11e9-a297-d4f547e7b13c", genres: ['agile', 'patterns', 'design'] },
  { title: 'Refactoring', published: 1999, author: 'Martin Fowler', id: "ffa1b5d2-31e4-11e9-a297-d4f547e7b13c", genres: ['refactoring'] },
  { title: 'Patterns of Enterprise Application Architecture', published: 2003, author: 'Martin Fowler', id: "ffa1b5d3-31e4-11e9-a297-d4f547e7b13c", genres: ['patterns'] },
  { title: 'Crime and Punishment', published: 1866, author: 'Fyodor Dostoevsky', id: "ffa1b5d4-31e4-11e9-a297-d4f547e7b13c", genres: ['classic', 'crime'] },
  { title: 'The Demons', published: 1872, author: 'Fyodor Dostoevsky', id: "ffa1b5d5-31e4-11e9-a297-d4f547e7b13c", genres: ['classic', 'revolution'] }
]

// 1. Описываем схему типов (Задания 8.1, 8.2, 8.3)
// Знак ! означает, что поле является обязательным (NOT NULL)
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
    genres: [String!]! # Массив строк
  }

  # Точка входа для всех запросов на чтение (GET)
  type Query {
    bookCount: Int!      # Задание 8.1: Общее число книг
    authorCount: Int!    # Задание 8.1: Общее число авторов
    allBooks(author: String, genre: String): [Book!]! # Задание 8.2: Список всех книг с фильтрами
    allAuthors: [Author!]! # Задание 8.3: Список всех авторов
  }
`

// 2. Пишем логику обработки запросов (Резолверы)
const resolvers = {
  Query: {
    // Задание 8.1
    bookCount: () => books.length,
    authorCount: () => authors.length,
    
    // Задание 8.2: Возвращаем книги с учетом необязательных фильтров по автору или жанру
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

    // Задание 8.3
    allAuthors: () => authors
  },

  // Задание 8.3: Пишем кастомный резолвер для динамического поля bookCount типа Author
  // Каждый раз, когда клиент запрашивает авторов, GraphQL будет автоматически считать их книги
  Author: {
    bookCount: (root) => {
      return books.filter(b => b.author === root.name).length
    }
  }
}

// Инициализируем и запускаем Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀 Server ready at ${url}`)
