const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const sanitizeHtml = require('sanitize-html')
const documentRouter = require('./routes/documents.js')
const userRouter = require('./routes/users')
const Document = require('./models/Document.js')

mongoose.connect('mongodb://localhost/text-edit')
    .then(mongoose => {
        const connection = mongoose.connections[0]
        const { host, port, name } = connection
        console.log(`${host}:${port}/${name}`)
    })
    .catch(error => console.log(error))

const app = express()
app.set('port', process.env.PORT || 3000)
app.set('view engine', '.pug')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

app.listen(app.get('port'), () => {
    console.log(`Сервер прослушивает порт ${app.get('port')}`)
})

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'))
app.use('/material-icons', express.static(__dirname + '/node_modules/material-icons'))
app.use('/tinymce', express.static(path.join(__dirname, '/node_modules/tinymce')))
app.use('/documents', documentRouter)
app.use('/user', userRouter)

app.get('/', async (req, res) => {

    if (!req.user) return res.render('user-login')

    const documents = await Document.find().sort({ timeCreated: 'desc' })
    documents.forEach(document => {
        document.text = sanitizeHtml(document.text)
        console.log(sanitizeHtml(document.text))
    })
    res.render('index', { documents, title: 'Все документы' })
})
