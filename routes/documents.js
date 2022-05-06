const express = require('express')
const router = express.Router()
const Document = require('../models/Document')

router.get('/new', (req, res) => {
  res.render('create-doc', { title: 'Новый документ' })
})

router.post('/', (req, res) => {
  const document = new Document({
    title: req.body.title,
    text: req.body.text,
    userId: req.user.id
  })

  document.save()
    .then(document => res.redirect(`documents/${document.slug}`))
    .catch(err => console.log(err))
})

router.get('/:slug', async (req, res) => {
  const document = await Document.findOne({ slug: req.params.slug })
  if (document) {
    res.render('view', { document, title: document.title })
  } else {
    res.redirect('/')
  }
})

router.get('/edit/:id', async (req, res) => {
  const document = await Document.findById(req.params.id)
  res.render('edit', { document, title: `Редактирование документа "${document.title}"` })
})

router.put('/:id', async (req, res) => {
  req.document = await Document.findById(req.params.id)
  let document = req.document
  document.title = req.body.title
  document.text = req.body.text

  try {
    document = await document.save()
    res.redirect(`/documents/${document.slug}`)
  } catch (error) {
    console.log(error.message)
    res.redirect(`/documents/edit/${document.id}`)
  }
})

router.delete('/:id', async (req, res) => {
  await Document.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

module.exports = router