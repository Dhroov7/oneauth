const hbs = require('express-hbs')
const debug = require('debug')('oauth:utils:handlebars')
hbs.registerHelper('ifneq',  (options) => {
    return (options.hash.expected != options.hash.val) ? options.fn(this) : options.inverse(this)
})
hbs.registerHelper('ifeq',  (options) => {
    debug('ifeq ---------- ')
    debug(options.hash)
    return (options.hash.expected == options.hash.val) ? options.fn(this) : options.inverse(this)
})
hbs.registerHelper('formatDate',  (date) => {
    debug(date)
    let dateObject = new Date(date)
    let dateString = dateObject.getDate() + "/" + dateObject.getMonth() + "/" + dateObject.getFullYear()
    return dateString
})

hbs.registerHelper('for', (from, to, incr, block) => {
  var accum = '';
  for(var i = from; i <= to; i += incr)
    accum += block.fn(i);
  return accum;
});
