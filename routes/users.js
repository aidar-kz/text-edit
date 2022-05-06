const express = require('express')
const passport = require('passport')
const crypto = require('crypto')
const LocalStrategy = require('passport-local')
const router = express.Router()

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email }, (err, user) => {
        if (err) return done(err)
        if (!user) return done(null, false, { message: 'Неверное имя пользователя или пароль' })

        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
            if (err) return done(err)
            if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
                return done(null, false, { message: 'Неверный пароль' })
            }
            return done(null, user)
        })
    })
}))

router.get('/register', (req, res) => res.render('user-register'))
router.get('/login', (req, res) => res.render('user-login'))

module.exports = router