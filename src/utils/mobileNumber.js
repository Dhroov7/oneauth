/**
 * Created by dhroovgupta7 on 30/09/18
 */

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

function parseNumber(number) {
    return phoneUtil.parseAndKeepRawInput(number)
}

function validateNumber(number) {
    return phoneUtil.isValidNumber(number)
}

module.exports = {
    parseNumber, validateNumber
}