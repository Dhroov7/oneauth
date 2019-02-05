const router = require('express').Router()
const passport = require('../../../passport/passporthandler')
const models = require('../../../db/models').models

const Raven = require('raven');
const { findUserForTrustedClient, findUserById } = require('../../../controllers/user')
const { findAllAddresses, findOrCreateDemographic, createAddress, findDemographic } = require('../../../controllers/demographics')
const { ensureTrustedClient } = require('../../../middlewares/acl')
const { validateNumber, parseNumberByCountry } = require('../../../utils/mobile_validator')
const {hasNull} = require('../../../utils/nullCheck')

router.get('/:id',
    passport.authenticate('bearer', { session: false }),
    async function (req, res) {
        // Send the user his own object if the token is user scoped
        if (req.user && !req.authInfo.clientOnly && req.user.id) {
            if (req.params.id == req.user.id) {
                return res.send(req.user)
            }
        }
        let trustedClient = req.client && req.client.trusted
        try {
            const user = await findUserForTrustedClient(trustedClient, req.params.id);
            if (!user) {
                throw new Error("User not found")
            }
            res.send(user)
        } catch (error) {
            res.send('Unknown user or unauthorized request')
        }
    }
)
router.get('/:id/address',
    // Only for server-to-server calls, no session auth
    passport.authenticate('bearer', { session: false }),
    async function (req, res) {
        let includes = [{
            model: models.Demographic,
            include: [{ model: models.Address, include: [models.State, models.Country] }]
        }]

        if (!req.authInfo.clientOnly) {
            // If user scoped token

            // Scoped to some other user: Fuck off bro
            if (req.params.id != req.user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
        } else {
            // If not user scoped

            // Check if trusted client or not
            if (!req.client.trusted) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
        }
        try {
            const addresses = await findAllAddresses(req.params.id, includes)
            return res.json(addresses)
        } catch (error) {
            Raven.captureException(error)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.status(500).json({ error: error.message })
        }
    }
)

router.post('/:id/address', ensureTrustedClient, async (req, res) => {

    if (hasNull(req.body, ['first_name', 'last_name', 'number', 'email', 'pincode', 'street_address', 'landmark', 'city', 'stateId', 'countryId', 'dial_code'])) {
        return res.send(400)
    } else {
        if (!req.body.label) {
            return red.status(400)
        }

        if (!req.body.dial_code) {
            return res.status(400)
        }

        try {
            const user = await findUserById(req.params.id, null)
            if (!user) {
                return res.send('User not found.')
            }

            const [demographics, created] = await findOrCreateDemographic(req.params.id)
            const options = {
                label: req.body.label || null,
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
                dial_code: req.body.dial_code,
                demographicId: demographics.id,
                whatsapp_number: req.body.whatsapp_number || null,
                // if no addresses, then first one added is primary
                primary: !demographics.addresses
            }

            let number = options.dial_code + options.mobile_number
            if (!validateNumber(parseNumberByCountry(number, req.body.countryId))) {
                return res.send(400)
            }
            const address = await createAddress(options)
            let includes = [{
                model: models.Demographic,
                include: [{ model: models.Address, include: [models.State, models.Country] }]
            }]
            const userAdderess = await findAllAddresses(req.params.id, includes)

            return res.send(userAdderess)
        } catch (err) {
            res.send('Error while adding address.')
        }
    }
})

module.exports = router 