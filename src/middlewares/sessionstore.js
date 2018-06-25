const session = require('express-session')
const Sequelize = require('sequelize')
const SequelizeSessionStore = require('connect-session-sequelize')(session.Store)

const db = require('../db/models').db

const sessions = db.define('session', {
    sid: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    userId: Sequelize.STRING,
    ipAddress:Sequelize.STRING,
    expires: Sequelize.DATE,
    data: Sequelize.STRING(50000)
})
const extendDefaultFields = (defaults, session) => ({
    data: defaults.data,
    expires: defaults.expires,
    userId: session.passport && session.passport.user,
    ipAddress: session.ip
})
const sessionStore = new SequelizeSessionStore({
    db,
    table: 'session',
    extendDefaultFields
})

function saveIp(req,res,next){
    let ip = req.ip
    sessions.create({
        userId:req.user.id,
        ipAddress:ip,
        data:JSON.stringify(req.session)
    }).then(() => {
        next()
    }).catch(err => {
        res.send(err)
    })

}
sessionStore.sync()

module.exports = {
    sessionStore,
    saveIp
}