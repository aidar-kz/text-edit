const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const router = express.Router()

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

}))

router.get('/register', (req, res) => res.render('user-register'))
router.get('/login', (req, res) => res.render('user-login'))

module.exports = router