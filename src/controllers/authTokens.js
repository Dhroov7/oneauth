const models = require('../db/models').models
const generator = require('../utils/generator')

exports = module.exports = {
    createAuthToken:(clientId,userId) => {
        return models.AuthToken.create({
            token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
            scope: ['*'],
            explicit: false,
            clientId: clientId,
            userId: userId
        })
    },

    findAuthToken:(clientId,userId) => {
        return models.AuthToken.findOne({
            where: {
                clientId: clientId,
                userId: userId
            }
        })
    },

    findCreateAuthToken:(grantCode) => {
        return  models.AuthToken.findCreateFind({
            where: {
                clientId: grantCode.clientId,
                userId: grantCode.userId,
                explicit: true
            },
            defaults: {
                token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
                scope: ['*'],
                explicit: true,
                clientId: grantCode.clientId,
                userId: grantCode.userId
            }
        })
    },

    createGrandCode: (clientId,userId) => {
        return  models.GrantCode.create({
            code: generator.genNcharAlphaNum(config.GRANT_TOKEN_SIZE),
            clientId: clientId,
            userId: userId
        })
    },

    findGrantCode: (code) => {
        return models.GrantCode.findOne({
            where: {code: code},
            include: [models.Client]
        })
    }
}