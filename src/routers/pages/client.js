/**
 * Created by championswimmer on 13/03/17.
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')
const acl = require('../../middlewares/acl')

const models = require('../../db/models').models

router.get('/me',
    cel.ensureLoggedIn('/login'),
     (req, res, next) => {
        models.Client.findAll({
            where: {userId: req.user.id}
        }).then((clients) => {
            return res.render('client/all', {clients: clients})
        }).catch( (err) => {
            res.send("No clients registered")
        })
    }
)

router.get('/',acl.ensureAdmin,(req,res,next) => {
    models.Client.findAll({})
        .then((clients) => {
            return res.render('client/all',{clients:clients})
        }).catch((err) => {
            res.send("No clients Registered")
    })
})

router.get('/add',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        return res.render('client/add')
    }
)

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        models.Client.findOne({
            where: {id: req.params.id}
        }).then( (client) => {
            if (!client) {
                return res.send("Invalid Client Id")
            }
            if (client.userId != req.user.id) {
                return res.send("Unauthorized user")
            }

            return res.render('client/id', {client: client})
        })
    }
)


router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        models.Client.findOne({
            where: {id: req.params.id}
        }).then((client) => {
            if (!client) {
                return res.send("Invalid Client Id")
            }
            if (client.userId != req.user.id) {
                return res.send("Unauthorized user")
            }
            client.clientDomains = client.domain.join(";")
            client.clientCallbacks = client.callbackURL.join(";")

            return res.render('client/edit', {client: client})
        })
    }
)

module.exports = router