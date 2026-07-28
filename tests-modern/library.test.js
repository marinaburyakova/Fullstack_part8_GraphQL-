import { describe, test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
// ИСПРАВЛЕНО: Убран лишний экспорт Book, который вызывал ошибку синтаксиса
import { setupDatabase, teardownDatabase, seedDatabase, createServer } from './test_helper.js'

let server

before(async () => {
  await setupDatabase()
  server = createServer()
})

beforeEach(async () => {
  await seedDatabase()
})

after(async () => {
  await teardownDatabase()
})

describe('GraphQL Library Queries', () => {
  test('bookCount returns correct number of books', async () => {
    const response = await server.executeOperation({
      query: 'query { bookCount }',
    })

    const result = response.body.singleResult
    assert.strictEqual(result.errors, undefined)
    assert.strictEqual(result.data.bookCount, 1)
  })

  test('allBooks returns books with populated author data', async () => {
    const response = await server.executeOperation({
      query: 'query { allBooks { title author { name } } }',
    })

    const result = response.body.singleResult
    assert.strictEqual(result.errors, undefined)
    assert.strictEqual(result.data.allBooks.length, 1)
    assert.strictEqual(result.data.allBooks[0].title, 'Clean Code')
    assert.strictEqual(result.data.allBooks[0].author.name, 'Robert Martin')
  })
})

describe('GraphQL Library Mutations', () => {
  test('createUser mutation registers new user successfully', async () => {
    const response = await server.executeOperation({
      query: `
        mutation {
          createUser(username: "marina2", favoriteGenre: "fantasy") {
            username
            favoriteGenre
          }
        }
      `
    })

    const result = response.body.singleResult
    assert.strictEqual(result.errors, undefined)
    assert.strictEqual(result.data.createUser.username, 'marina2')
  })
})
