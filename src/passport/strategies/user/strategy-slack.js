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
    Raven.setContext({extra: {file: 'slackstrategy'}})
    try {

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
    } catch (err) {
        Raven.captureException(err)
        cb(null, false, {message: err.message})
    }

})