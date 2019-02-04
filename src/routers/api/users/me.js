const router = require('express').Router()
const passport = require('../../../passport/passporthandler')
const models = require('../../../db/models').models

const Raven = require('raven');
const { findUserById } = require('../../../controllers/user')
const { deleteAuthToken } = require('../../../controllers/oauth')

router.get('/me',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    async function (req, res) {

        if (req.user && !req.authInfo.clientOnly && req.user.id) {
            let includes = []
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (let ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'linkedin':
                            includes.push({model: models.UserLinkedin, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                        case 'demographic':
                            includes.push({ model: models.Demographic, include: [models.College] })
                            break
                        case 'organisation':
                            includes.push({ model: models.Organisation })
                            break
                    }
                }
            }
            try {
                const user = await findUserById(req.user.id,includes);
                if (!user) {
                    throw new Error("User not found")
                }
                res.send(user)
            } catch (error) {
                res.send('Unknown user or unauthorized request')
            }
        } else {
            return res.status(403).json({error: 'Unauthorized'})
        }
    })

router.get('/me/address',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    async function (req, res) {
        if (req.user && req.user.id) {
            let includes = [{model: models.Demographic,
            include: [models.Address]
            }]
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (let ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'linkedin':
                            includes.push({model: models.UserLinkedin, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                    }
                }
            }
            try {
                const user = await findUserById(req.user.id,includes);
                if (!user) {
                    throw new Error("User not found")
                }
                res.send(user)
            } catch (error) {
                res.send('Unknown user or unauthorized request')
            }
        } else {
            return res.sendStatus(403)
        }
    })

router.get('/me/logout',
    passport.authenticate('bearer', {session: false}),
    async function (req, res) {
        if (req.user && req.user.id) {
            let token = req.header('Authorization').split(' ')[1];
            try {
                await deleteAuthToken(token)
                res.status(202).send({
                    'user_id': req.user.id,
                    'logout': "success"
                })
            } catch (error) {
                res.status(501).send(error)
            }
        } else {
            res.status(403).send("Unauthorized")
        }
    }
)

module.exports = router