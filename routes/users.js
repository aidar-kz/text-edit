const express = require('express')
const passport = require('passport')
const crypto = require('crypto')
const LocalStrategy = require('passport-local')
const router = express.Router()
const User = require('../models/User')

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

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, { id: user.id, email: user.email })
    })
})

passport.deserializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user)
    })
})

router.get('/register', (req, res) => res.render('user-register'))
router.get('/login', (req, res) => res.render('user-login'))

router.post('/register', async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        req.session.messages.push('Пользователь с таким email уже зарегистрирован')
        return res.redirect('/user/register')
    }

    const salt = crypto.randomBytes(16)
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
        if (err) return next(err)

        const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            hashedPassword,
            salt
        })

        user.save().then(user => {
            req.login(user, err => {
                if (err) return next(err)
                res.redirect('/')
            })
        })
            .catch(err => console.log(err))
    })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureMessage: true
}))

router.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router