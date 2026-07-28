import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/user.js'

dotenv.config()

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding...')
    await User.deleteMany({}) // Очищаем старых юзеров
    
    const user = new User({
      username: 'marina',
      favoriteGenre: 'fantasy'
    })

    await user.save()
    console.log('Test user created successfully! Username: marina, Favorite: fantasy')
    mongoose.connection.close()
  })
