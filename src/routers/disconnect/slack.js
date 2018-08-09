const router = require('express').Router()
const models = require('../../db/models').models

function DisconnectSlack(req, res) {

    let existingUser = req.user

    if (!existingUser) {

        req.flash('error','You can only connect with existing account,not create a new one.')
        res.redirect('/')

    }
    else {

        models.UserSlack.destroy({
            where: {userId: req.user.id}
        })
            .then(function (result) {
                return res.redirect('/users/me')
            })
            .catch((err) => {
                Raven.captureException(err)
                res.status(503).send({message: "There was an error disconnecting Slack."})
            })

    }

}


module.exports = DisconnectSlack