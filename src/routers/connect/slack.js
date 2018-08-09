const router = require('express').Router()
const passport = require('../../passport/passporthandler')

router.get('/', passport.authorize('slack'))

router.get('/callback', passport.authorize('slack'),function (req,res) {
    res.redirect('/users/me')
})

module.exports = router