/**
 * Created by bhavyaagg on 19/05/18.
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')

const models = require('../../db/models').models
const authTokensController = require('../../controllers/authTokens')

router.get('/',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        let includes = []
        includes.push(models.Client)
        try{
            const apps = await authTokensController.findAllAuthTokens(req.user.id,includes)
            return res.render('apps/all', {apps: apps})
        }catch(err){
            return res.send("No clients registered")
        }
    }
)

router.get('/:clientId/delete',cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        try{
            const authToken = await authTokensController.findAuthToken(+req.params.clientId,req.user.id)
            if(!authToken){
                return res.send("Invalid App")
            }

            if(authToken.userId != req.user.id){
                return res.send("Unauthorized user")
            }

            authToken.destroy();
            return res.redirect('/apps/')
        }catch(err){
            return res.send(err)
        }
    }
)



module.exports = router
