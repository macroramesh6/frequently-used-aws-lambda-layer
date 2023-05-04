const MYSQLClient = require('./connect-to-mysqldb');
const users = require('./models/users');

module.exports = {
    ...MYSQLClient,
    ...users,
    // ...other_table
};