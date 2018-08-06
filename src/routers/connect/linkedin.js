const router = require('express').Router()
const passport = require('../../passport/passporthandler')

const config = require('../../../config')
const debug = require('debug')('oauth:connect:linkedin')

function AuthzLinkedin(req, res, next) {
        if (config.DEBUG) debug("Authz Linkedin = = = = = = ")
        passport.authorize('linkedin', {
            //TODO: Add failure flash
            failureRedirect: '/users/me',
            failureFlash: true
        })(req, res, next)
}

router.get('/', passport.authorize('linkedin'))


router.get('/callback',AuthzLinkedin ,function (req,res) {
    res.redirect('/users/me')
})

module.exports = router