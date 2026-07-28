import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4 // Требование задания 8.15
  },
  born: {
    type: Number,
  },
})

export default mongoose.model('Author', schema)
