const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)
const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timeCreated: {
    type: Date,
    default: () => Date.now(),
  },
  slug: {
    type: String,
    slug: 'title',
    unique: true,
    slug_padding_size: 2
  },
})

module.exports = mongoose.model('Document', documentSchema)