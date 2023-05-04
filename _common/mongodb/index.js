const MongoClient = require('./connect-to-mongodb');
const users = require('./models/users');

module.exports = {
    ...MongoClient,
    ...users
    // ...otherCollections,
}