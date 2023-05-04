'use strict';
// Import dependency.
const {MongoClient} = require('mongodb');

// Function for connecting to MongoDB, returning a new or cached database connection
module.exports.connectToDatabase = async function connectToDatabase(params) {


// Connection string to the database
  const uri = params.MONGODB_URI;
  const database = params.MONGODB_DATABASE;

// Cached connection promise
  let cachedPromise = null;


  if (!cachedPromise) {
    // If no connection promise is cached, create a new one. We cache the promise instead
    // of the connection itself to prevent race conditions where connect is called more than
    // once. The promise will resolve only once.
    // Node.js driver docs can be found at http://mongodb.github.io/node-mongodb-native/.
    cachedPromise =
      MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
  }
  // await on the promise. This resolves only once.
  const client = await cachedPromise;

  // Specify which database we want to use
  const db = await client.db(database);

  return db;
};

/**
 * This function is similar to the above function `connectToDatabase`.
 * The difference is that we don't need to pass the database name in the params.
 * Since the above function used in many places, we don't want to change it.
 * It works just with the connection string.
 * @param MONGODB_URI
 * @returns {Promise<null>}
 */
module.exports.connectToDatabaseWithURI = async function connectToDatabase(MONGODB_URI) {

// Cached connection promise
  let cachedPromise = null;

  if (!cachedPromise) {
    // If no connection promise is cached, create a new one. We cache the promise instead
    // of the connection itself to prevent race conditions where connect is called more than
    // once. The promise will resolve only once.
    // Node.js driver docs can be found at http://mongodb.github.io/node-mongodb-native/.
    cachedPromise = MongoClient.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  }
  // await on the promise. This resolves only once.
  const client = await cachedPromise;
  // Specify which database we want to use
  return client;
};