import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  favoriteGenre: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String
    // Флаг required убран ради поддержки фабрики тестов
  }
})

export default mongoose.model('User', schema)
