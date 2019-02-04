const router = require('express').Router()
const passport = require('../../../passport/passporthandler')
const models = require('../../../db/models').models
const uid = require('uid2')
const mail = require('../../../utils/email')

const Raven = require('raven');
const { findAllUsersWithFilter, findUserByParams, createUserLocal } = require('../../../controllers/user')
const { ensureTrustedClient } = require('../../../middlewares/acl')
const { validateNumber, parseNumberEntireString } = require('../../../utils/mobile_validator')
const passutils = require('../../../utils/password')

router.get('/',
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
      let users = await findAllUsersWithFilter(trustedClient, req.query);
      if (!users) {
        throw new Error("User not found")
      }
      if (!Array.isArray(users)) {
        users = [users]
      }
      res.send(users)
    } catch (error) {
      res.send('Unknown user or unauthorized request')
    }
  }
)

router.post('/', ensureTrustedClient, async (req, res) => {

  let user = {}

  if (!req.body.username) {
    res.status(400)
  } else {
    user.username = req.body.username
  }

  if (!req.body.firstname) {
    res.status(400)
  } else {
    user.firstname = req.body.firstname
  }

  if (!req.body.lastname) {
    res.status(400)
  } else {
    user.lastname = req.body.lastname
  }

  if (!req.body.email) {
    res.status(400)
  } else {
    user.email = req.body.email
  }

  if (!req.body.mobile_number) {
    res.status(400)
  }

  if (!req.body.dial_code) {
    res.status(400)
  }

  try {
    let user_exist = await findUserByParams({ username: req.body.username })
    if (user_exist) {
      return res.status(400)
    }

    if (!(validateNumber(parseNumberEntireString(req.body.dial_code + '-' + req.body.mobile_number)))) {
      res.status(400)
    }

    user_exist = await findUserByParams({ email: req.body.email })

    if (user_exist) {
      return res.status(400)
    }

    let query = {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile_number: req.body.dial_code + '-' + req.body.mobile_number,
      demographic: {
        branchId: req.body.branchId || null,
        collegeId: req.body.collegeId || null
      }
    }

    let includes = [{model: models.User, include: [models.Demographic]}]
    let password = await passutils.pass2hash(uid(30))

    const userLocal = await createUserLocal(query, password, includes)

    let key = uid(15)
    mail.forgotPassEmail(userLocal, key)

    res.send(userLocal)
  } catch (err) {
    res.send('Error while creating user.')
  }

})

module.exports = router