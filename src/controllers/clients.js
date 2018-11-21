const generator = require("../utils/generator");
const urlutils = require("../utils/urlutils");
const { Client, User, UserClient } = require("../db/models").models;

function findClientById(id) {
  return Client.findOne({
    where: { id }
  });
}

async function createClient(options, userId) {
  options.defaultURL = urlutils.prefixHttp(options.defaultURL);

  //Make sure all urls have http in them
  options.clientDomains.forEach(function(url, i, arr) {
    arr[i] = urlutils.prefixHttp(url);
  });
  options.clientCallbacks.forEach(function(url, i, arr) {
    arr[i] = urlutils.prefixHttp(url);
  });
  const client = await Client.create({
    id: generator.genNdigitNum(10),
    secret: generator.genNcharAlphaNum(64),
    name: options.clientName,
    domain: options.clientDomains,
    defaultURL: options.defaultURL,
    callbackURL: options.clientCallbacks
  })

  await UserClient.create({
      clientId: client.id,
      userId: userId
  })

  return client
}
function updateClient(options, clientId) {
  options.defaultURL = urlutils.prefixHttp(options.defaultURL);
  //Make sure all urls have http in them
  options.clientDomains.forEach(function(url, i, arr) {
    arr[i] = urlutils.prefixHttp(url);
  });
  options.clientCallbacks.forEach(function(url, i, arr) {
    arr[i] = urlutils.prefixHttp(url);
  });

  let update = {
      name: options.clientName,
      domain: options.clientDomains,
      defaultURL: options.defaultURL,
      callbackURL: options.clientCallbacks,
      trusted: options.trustedClient
    }
  if (options.webhookURL) {
    update.webhookURL = options.webhookURL
  }
  return Client.update( update, {
      where: { id: clientId }
    }
  );
}

function findAllClients() {
  return Client.findAll({});
}

function findAllClientsByUserId(userId) {
  return User.findById(userId, {
      include: Client
  }).then(user => user.clients)
}

function findUserByClientId(clientId) {
  return UserClient.find({
      where: {clientId}
  })
}

module.exports = {
  createClient,
  updateClient,
  findClientById,
  findAllClients,
  findAllClientsByUserId,
  findUserByClientId
};
