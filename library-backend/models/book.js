import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5 // Требование задания 8.15
  },
  published: {
    type: Number,
  },
  // Поле author теперь ссылается на коллекцию Author в MongoDB
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [
    { type: String }
  ]
})

export default mongoose.model('Book', schema)
