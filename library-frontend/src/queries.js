import { gql } from '@apollo/client'

// Задание 8.8: Запрос на получение списка всех авторов
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

// Задание 8.9: Запрос на получение списка всех книг
export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
      id
    }
  }
`

// Задание 8.10: Мутация добавления новой книги с использованием GraphQL-переменных ($)
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author
      published
      genres
      id
    }
  }
`

// Задание 8.11: Мутация изменения года рождения автора
export const EDIT_BORN = gql`
  mutation editBorn($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      name
      born
      id
    }
  }
`
