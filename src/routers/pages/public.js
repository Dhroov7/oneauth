/**
 * Created by championswimmer on 13/03/17.
 *
 * This route contains pages that are visible to public (without logging in)
 */
const cel = require('connect-ensure-login')
const models = require('../../db/models').models
const router = require('express').Router()
const verifyemail = require('../../routers/verifyemail')
const demographicsController = require('../../controllers/demographics')


router.get('/login', cel.ensureNotLoggedIn('/'), function (req, res, next) {
    res.render('login', {title: "Login | OneAuth", error: req.flash('error')})
})
router.get('/signup', cel.ensureNotLoggedIn('/'), async (req, res, next) => {
    try{
        const colleges = await demographicsController.getColleges()
        const branches = await demographicsController.getBranches()
        return res.render('signup', {title: "Signup | OneAuth", colleges:colleges, branches:branches})
    }catch(err){
        return res.send(err)
    }
})

router.get('/forgot/password/new/:key', cel.ensureNotLoggedIn('/'), function (req, res, next) {
    //FIXME: Check if the key is correct, and prevent rendering if so
    res.render('forgot/password/new', {title: "Setnewpassword | OneAuth", key: req.params.key})
})

router.get('/verifyemail/inter', cel.ensureLoggedIn('/login'), function (req, res, next) {

    res.render('verifyemail/inter', {title: "Verifyemailinter | OneAuth"})

})

router.get('/client/add', cel.ensureLoggedIn('/login'), function (req, res, next) {
        res.render('client/add', {title: "Add New Client | OneAuth"})
    })


module.exports = router
