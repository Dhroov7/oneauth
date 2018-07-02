const models = require('../db/models').models

exports = module.exports = {
    findCreateDemographic: (userId) => {
       return models.Demographic.findCreateFind({
            where: {userId: userId},
            include: [models.Address]
        })
    },

    createAddress :(req,demographics) => {
       return models.Address.create({
            label: req.body.label,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.number,
            email: req.body.email,
            pincode: req.body.pincode,
            street_address: req.body.street_address,
            landmark: req.body.landmark,
            city: req.body.city,
            stateId: req.body.stateId,
            countryId: req.body.countryId,
            demographicId: demographics.id,
            // if no addresses, then first one added is primary
            primary: !demographics.get().addresses
        })
    },

    updateAddress : (req,addrId) => {
        return models.Address.update({
                label: req.body.label,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                mobile_number: req.body.number,
                email: req.body.email,
                pincode: req.body.pincode,
                street_address: req.body.street_address,
                landmark: req.body.landmark,
                city: req.body.city,
                stateId: req.body.stateId,
                countryId: req.body.countryId,
                primary: req.body.primary === 'on'
            },
            { where: {id: addrId} }
        )
    },

    findAllAddress :(userId) => {
        return models.Address.findAll({
            where: {'$demographic.userId$': userId},
            include: [models.Demographic]
        })
    },

    findAddress:(id,userId) => {
        return models.Address.findOne({
            where: {
                id: id,
                '$demographic.userId$': userId
            },
            include: [models.Demographic, models.State, models.Country]
        })
    },

    getStates: () => {
        return models.State.findAll({})
    },

    getCountries : () => {
        return models.Country.findAll({})
    },

    getBranches : () => {
        return models.Branch.findAll({})
    },

    getColleges : () => {
        return models.College.findAll({})
    }
}