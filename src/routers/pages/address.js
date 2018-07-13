const router = require('express').Router()
const cel = require('connect-ensure-login')
const Raven = require('raven')

const models = require('../../db/models').models
const demographicsController = require('../../controllers/demographics')

router.get('/',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {

        try{
            const addresses = await demographicsController.findAllAddress(req.user.id)
            return res.render('address/all', {addresses})
        }catch(err){
            Raven.captureException(err)
                req.flash('error', 'Something went wrong trying to query address database')
                return res.redirect('/users/me')
        }
    }
)

router.get('/add',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        try{
            const [states,countries] = await Promise.all([demographicsController.getStates(),demographicsController.getCountries()])
            return res.render('address/add', {states, countries})
        }catch(err){
            return res.send("Error Fetching Data.")
        }
    }
)

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        try{
            const address = await demographicsController.findAddress(req.params.id,req.user.id)
            if(!address){
                req.flash('error', 'Address not found')
                return res.redirect('.')
            }
            return res.render('address/id', {address})
        }catch(err){
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        }
    }
)


router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        try{
            const [address,states,countries] = await Promise.all([demographicsController.findAddress(req.params.id,req.user.id),demographicsController.getStates(),demographicsController.getCountries()])
            if (!address) {
                req.flash('error', 'Address not found')
                return res.redirect('.')
            }
            return res.render('address/edit', {address, states, countries})
        }catch(err){
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        }
    }
)

module.exports = router
