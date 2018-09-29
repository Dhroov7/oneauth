const generator = require("../utils/generator");

function deleteEventSubscription(id) {
  return EventSubscription.destroy({
    where: { 
      clientId: id 
    }
  });
}

function findAllEventSubscription(id) {
  return EventSubscription.findAll({
    where: { 
      clientId: id 
    }
  });
}

function createEventSubscriptionBulk (options) {
  return EventSubscription.bulkCreate (options)
}

module.exports = {
  createEventSubscriptionBulk,
  deleteEventSubscription,
  findAllEventSubscription
};
