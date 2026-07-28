// Чистый JavaScript файл для безопасного обновления кэша Apollo
export const updateCache = (cache, query, addedBook) => {
  const uniqById = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.id
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, (data) => {
    if (!data) return
    return {
      allBooks: uniqById(data.allBooks.concat(addedBook)),
    }
  })
}
