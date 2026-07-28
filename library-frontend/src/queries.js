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
// Задание 8.18: Мутация логина
export const LOGIN = gql`
  mutation login($username: String!) {
    login(username: $username) {
      value
    }
  }
`

// Задание 8.19: Запрос профиля пользователя
export const USER_ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

// Задание 8.21: Запрос книг с фильтрацией по жанру (для рекомендаций и фильтров)
export const ALL_BOOKS_BY_GENRE = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      id
      genres
    }
  }
`