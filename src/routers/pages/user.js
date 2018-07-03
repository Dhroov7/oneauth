/**
 * Created by championswimmer on 13/03/17.
 */
const Raven = require('raven')
const cel = require('connect-ensure-login')
const router = require('express').Router()
const {hasNull} = require('../../utils/nullCheck')
const passutils = require('../../utils/password')
const models = require('../../db/models').models
const acl = require('../../middlewares/acl')
const multer = require('../../utils/multer')
const userController = require('../../controllers/user')
const demographicsController = require('../../controllers/demographics')
const clientController = require('../../controllers/client')

router.get('/me',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        try{
            let includes = []
            includes.push(models.UserTwitter,models.UserGoogle,models.UserGithub,models.UserFacebook,{model:models.Demographic,include:[models.College,models.Branch,models.Company]})
            const user = await userController.getUserById(req.user.id,includes)
            if(!user){
               return res.redirect('/login')
            }
            return res.render('user/me', {user:user})
        }catch(err){
            return res.send(err)
        }

    })

router.get('/me/edit',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {

        let includes = []
        includes.push({model:models.Demographic,include:[models.College,models.Branch,models.Company]})
        try{
            const user = await userController.getUserById(req.user.id,includes)
            const colleges = await demographicsController.getColleges()
            const branches = await demographicsController.getBranches()
            if(!user){
                return res.redirect('/login')
            }
            return res.render('user/me/edit', {user, colleges, branches})
        }catch(err){
            return res.send(err)
        }
    }
)

router.post('/me/edit',
    cel.ensureLoggedIn('/login'),

    function(req, res, next) {
        var upload = multer.upload.single('userpic')
        upload(req, res, function (err) {
            if(err) {
                if (err.message === 'File too large') {
                    req.flash('error', 'Profile photo size exceeds 2 MB')
                    return res.redirect('edit')
                } else {
                    Raven.captureException(err)
                    req.flash('error', 'Error in Server')
                    return res.redirect('/')
                }
            } else {
                next()
            }
        })
    },
    async function (req, res, next) {
        //exit if password doesn't match
        if ((req.body.password) && (req.body.password !== req.body.repassword)) {
            req.flash('error', 'Passwords do not match')
            return res.redirect('edit')
        }

        // Check name isn't null
        if (hasNull(req.body, ['firstname', 'lastname'])) {
            req.flash('error', 'Null values for name not allowed')
            return res.redirect('/')
        }

        try {
            let includes = []
            includes.push(models.Demographic)
            const user = await userController.getUserById(req.user.id,includes)
            const demographic = user.demographic || {};
            
            user.firstname = req.body.firstname
            user.lastname = req.body.lastname
            if (!user.verifiedemail && req.body.email !== user.email) {
                user.email = req.body.email
            }

            let prevPhoto = ""
            if (user.photo) {
                prevPhoto = user.photo.split('/').pop()
            }
            if (req.file) {
                user.photo = req.file.location
            } else if(req.body.avatarselect) {
                user.photo = `https://minio.cb.lk/img/avatar-${req.body.avatarselect}.svg`
            }

            await user.save()

            if ((req.file || req.body.avatarselect) && prevPhoto) {
                multer.deleteMinio(prevPhoto)
            }

            demographic.userId = demographic.userId || req.user.id;
            if (req.body.branchId) {
                demographic.branchId = +req.body.branchId
            }
            if (req.body.collegeId) {
                demographic.collegeId = +req.body.collegeId
            }
            await models.Demographic.upsert(demographic, {
                where: {
                    userId: req.user.id
                }
            })

            if (req.body.password) {
                const passHash = await passutils.pass2hash(req.body.password)
                await models.UserLocal.update({
                    password: passHash
                }, {
                    where: {userId: req.user.id}
                })
            }
            return res.redirect('/users/me')
        } catch (err) {
            Raven.captureException(err)
            req.flash('error', 'Error in Server')
            return res.redirect('/')
        }

    })

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    acl.ensureRole('admin'),
    async (req, res, next) => {
        let includes = []
        includes.push(models.UserFacebook,models.UserGithub,models.UserGoogle,models.UserLms,models.UserTwitter)
        try{
            const user = await userController.getUserById(req.params.id,includes)
            if(!user){
                return res.status(404).send({error: "Not found"})
            }
            return res.render('user/id',{user:user})
        }catch(err){
            return res.send(err)
        }
    }
)

router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    acl.ensureRole('admin'),
    async (req, res, next) => {
    try{
           const user = await userController.getUserById(req.params.id, {})
           if(!user){
               return res.status(404).send({error: "Not found"})
           }
           return res.render('user/id/edit',{user:user})
       }catch(err){
        return res.send(err)
       }
    }
)

router.post('/:id/edit',
    cel.ensureLoggedIn('/login'),
    acl.ensureRole('admin'),
    async (req, res, next) => {

        try{
            const updatedUser = userController.updateUser(req)
            return res.redirect('../' + req.params.id)
        }catch(err){
            return res.send(err)
        }
    }
)

router.get('/me/clients',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
         try{
             const clients = await clientController.findAllClientsWithUserId(req.user.id)
             return res.render('client/all', {clients: clients})
         }catch(err){
             return res.send("No clients registered")
         }
    }
)

module.exports = router
