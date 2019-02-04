function ensureAdmin(req, res, next) {
     if ((req.user.role === 'admin')) {
         next()
     } else {
         res.status(403).render('error')  //403 error, Unauthorized user
     }
}

function ensureRole(role) {
    return function (req, res, next) {
        if (req.user.role === role) {
            next()
        } else {
            res.status(403).send({error: 'Unauthorized'})
        }
    }
}

function ensureTrustedClient(req, res, next) {
    if(req.client && req.client.trusted) {
        next()
    }else{
        res.status(403).render('error')
    }
}

module.exports = {
    ensureAdmin,
    ensureRole,
    ensureTrustedClient
}
