const Raven = require('raven')
const SlackStrategy = require('passport-slack').Strategy

const models = require('../../../db/models').models

const config = require('../../../../config')
const secrets = config.SECRETS
const passutils = require('../../../utils/password')
const debug = require('debug')('oauth:strategies:slack')


module.exports = new SlackStrategy({
    clientID: secrets.SLACK_CLIENT_ID,
    clientSecret: secrets.SLACK_CLIENT_SECRET,
    callbackURL: config.SERVER_URL + config.SLACK_CALLBACK,
    passReqToCallback: true,
    scope: ['identity.basic', 'identity.email', 'identity.avatar', 'identity.team'],
}, async function (req, token, tokenSecret, profile, cb) {
    let profileJson = profile
    let oldUser = req.user
    Raven.setContext({extra: {file: 'slackstrategy'}})
    try {
        if (oldUser) {
            debug('User exists, is connecting Slack account')

            const skaccount = await models.UserSlack.findOne({where: {id: profileJson.id}})
            if (skaccount) {
                throw new Error('Your Slack account is already linked with codingblocks account Id: ' + skaccount.dataValues.userId)
            } else {
                const updated = await models.UserSlack.upsert({
                    id: profileJson.id,
                    token: token,
                    tokenSecret: tokenSecret,
                    username: profileJson.displayName,
                    userId: oldUser.id
                })

                const user = await models.User.findById(oldUser.id)

                if (user) {
                    return cb(null, user.get())
                } else {
                    return cb(null, false, {message: "Could not retrieve existing Slack linked account"})
                }
            }
        } else {

            let userSlack = await models.UserSlack.findOne({
                include: [models.User],
                where: {id: profileJson.id}
            })

            if (!userSlack) {

                const existingUsers = await models.User.findAll({
                    include: [{
                        model: models.UserSlack,
                        attributes: ['id'],
                        required: false
                    }],
                    where: {
                        email: profileJson.email,
                        '$userslack.id$': {$eq: null}
                    }
                })
                if (existingUsers && existingUsers.length > 0) {
                    let oldIds = existingUsers.map(eu => eu.id).join(',')
                    return cb(null, false, {
                        message: `
                    Your email id "${profileJson.email}" is already used in the following Coding Blocks Account(s): 
                    [ ${oldIds} ]
                    Please log into your old account and connect Slack in it instead.
                    Use 'Forgot Password' option if you do not remember password of old account`
                    })
                }


                /* Check if users with same username exist. Modify username accordingly */
                const existCount = await models.User.count({where: {username: profileJson.displayName}})

                userSlack = await models.UserSlack.create({
                    id: profileJson.id,
                    token: token,
                    tokenSecret: tokenSecret,
                    username: profileJson.displayName,
                    user: {
                        firstname: profileJson.displayName ? profileJson.displayName.split(' ')[0] : profileJson.displayName,
                        lastname: profileJson.displayName ? profileJson.displayName.split(' ').pop() : profileJson.displayName,
                        email: profileJson.user.email,
                        photo: profileJson.avatar_url
                    }
                }, {
                    include: [models.User],
                })
                if (!userSlack) {
                    return cb(null, false, {message: 'Authentication Failed'})
                }

            }

            return cb(null, userSlack.user.get())
        }
    } catch (err) {
        Raven.captureException(err)
        cb(null, false, {message: err.message})
    }

})