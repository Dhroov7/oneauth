const models = require('../db/models').models
const generator = require('../utils/generator')

exports = module.exports = {
    createClient: (reqQuery,clientName,clientDomains,defaultURL,clientCallbacks) => {
        return  models.Client.create({
            id: generator.genNdigitNum(10),
            secret: generator.genNcharAlphaNum(64),
            name: clientName,
            domain: clientDomains,
            defaultURL: defaultURL,
            callbackURL: clientCallbacks,
            userId: reqQuery.user.id
        })
    },

    updateClient:(clientName,clientDomains,defaultURL,clientCallbacks,trustedClient) => {
        return models.Client.update({
            name: clientName,
            domain: clientDomains,
            defaultURL: defaultURL,
            callbackURL: clientCallbacks,
            trusted:trustedClient
        }, {
            where: {id: clientId}
        })
    },

    findAllClients:() => {
        return models.Client.findAll({})
    },

    findOneClient:(reqQuery) => {
        return models.Client.findOne({
            where: {id: reqQuery}
        })
    }
}