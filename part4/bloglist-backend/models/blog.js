const mongoose = require('mongoose')

// The note.js file under the models directory only defines the Mongoose schema for notes.
const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: { type: Number, default: 0 },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)