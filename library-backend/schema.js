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
    _resetDatabase: Boolean 
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    
    editAuthor(name: String!, setBornTo: Int!): Author
    login(username: String!, password: String!): Token
    createUser(username: String!, favoriteGenre: String!): User!
  }

  type Subscription {
    bookAdded: Book!
  }
`

export default typeDefs
