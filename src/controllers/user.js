const models = require('../db/models').models

exports = module.exports = {
    getUserById: (userId,includes) => {
        return models.User.findOne({
            where: {id: userId},
            include: includes
        })
    },

    updateUser:(reqQuery) => {
        return models.User.update({
                firstname: reqQuery.body.firstname,
                lastname: reqQuery.body.lastname,
                email: reqQuery.body.email,
                role: reqQuery.body.role !== 'unchanged' ? reqQuery.body.role : undefined
            },
            {
                where: {id: reqQuery.params.id},
                returning: true
        })
    },

    getUserForTrustedClient:(userId,trustedClient) => {
        return  models.User.findOne({
            attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
            where: {id: userId}
        })
    },

    findAllUsersWithEmail: (email) => {
        return models.User.findAll({where: {email: email}})
    }
}