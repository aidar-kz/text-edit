const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')
const sanitizeHtml = require('sanitize-html')
const documentRouter = require('./routes/documents.js')
const userRouter = require('./routes/users')
const Document = require('./models/Document.js')
const User = require('./models/User.js')

const dbURL = 'mongodb://localhost/text-edit'

mongoose.connect(dbURL)
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
app.use(session({
    secret: 'secret cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURL })
}))
app.use(passport.authenticate('session'))
app.use((req, res, next) => {
    const msgs = req.session.messages || []
    res.locals.messages = msgs
    res.locals.hasMessages = !!msgs.length
    req.session.messages = []
    next()
})

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
    const user = await User.findOne({ email: req.user.email })
    const documents = await Document.find().sort({ timeCreated: 'desc' })
    documents.forEach(document => document.text = sanitizeHtml(document.text))
    res.render('index', { user, documents, title: 'Все документы' })
})