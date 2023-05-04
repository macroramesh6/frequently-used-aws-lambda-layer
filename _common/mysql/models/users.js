/**
 * This is just a sample/test template for you to copy for the actual table in the DB.
 */

const queryBuilder = require('../utils/queryBuilder');

/**
 * to get uses by ID
 * @param id String
 * @param callback onSuccess(error, result)
 */
const get_user_by_id = function (db_connection, id, callback) {

  let where = [{
    key: 'id',
    value: id,
  }];

  db_connection.query(queryBuilder.buildSelectQuery('users', where), function (err, result) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });

}

/**
 * to get all the users in the table
 * @param callback onSuccess(error, result)
 */
const get_all_users = function (db_connection, callback) {
  db_connection.query(queryBuilder.buildSelectQuery('users'), function (err, result) {
    if (err) {
      callback(err, null)
    } else {
      callback(null, result)
    }
  });
}


module.exports = {
  get_user_by_id,
  get_all_users
}
