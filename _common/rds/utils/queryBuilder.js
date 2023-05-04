let GLOBAL_MYSQL_LIMIT = 10;
let GLOBAL_MYSQL_OFFSET = 0;

/**
 * To build LIMIT query, 10 is the default limit
 * @param limit
 * @returns {string}
 */
const buildLimitQuery = (limit) => {
  let limitQuery = '';
  if (limit.length > 0) {
    limitQuery += ` LIMIT ${limit}`;
  } else {
    limitQuery += ` LIMIT ${GLOBAL_MYSQL_LIMIT}`;
  }
  return limitQuery;
};

/**
 * To build WHERE query
 * @param where
 * @returns {string}
 */
const buildWhereQuery = (where) => {
  let whereQuery = '';
  if (where.length > 0) {
    where.forEach((item, index) => {
      if (index === 0) {
        whereQuery += ` WHERE ${item.column} ${item.operator} ${item.value}`;
      } else {
        whereQuery += ` AND ${item.column} ${item.operator} ${item.value}`;
      }
    });
  }
  return whereQuery;
};

/**
 * To build OFFSET query
 * @param offset
 * @returns {string}
 */
const buildOffsetQuery = (offset) => {
  let offsetQuery = '';
  if (offset.length > 0) {
    offsetQuery += ` OFFSET ${offset}`;
  } else {
    offsetQuery += ` OFFSET ${GLOBAL_MYSQL_OFFSET}`;
  }
  return offsetQuery;
};

/**
 * To build ORDER BY query
 * @param orderBy
 * @returns {string}
 */
const buildOrderByQuery = (orderBy) => {
  let orderByQuery = '';
  if (orderBy.length > 0) {
    orderBy.forEach((item, index) => {
      if (index === 0) {
        orderByQuery += ` ORDER BY ${item.key} ${item.order}`;
      } else {
        orderByQuery += `, ${item.key} ${item.order}`;
      }
    });
  }
  return orderByQuery;
};

/**
 * To build INSERT query
 * @param tableName
 * @param data
 * @returns {string}
 */
const buildInsertQuery = (tableName, data) => {
  let insertQuery = `INSERT INTO \`${tableName}\``;
  let keys = Object.keys(data);
  let values = keys.map(key => data[key]);
  insertQuery += `(${keys.join(', ')}) VALUES (${values.join(', ')})`;
  return insertQuery;
};

/**
 * To build UPDATE Query
 * @param tableName
 * @param data
 * @param where
 * @returns {string}
 */
const buildUpdateQuery = (tableName, data, where) => {

  let updateQuery = `UPDATE \`${tableName}\` SET`;
  let keys = Object.keys(data);
  let values = keys.map(key => data[key]);
  keys.forEach((key, index) => {
    if (index === 0) {
      updateQuery += ` ${key} = ${values[index]}`;
    } else {
      updateQuery += `, ${key} = ${values[index]}`;
    }
  });
  updateQuery += buildWhereQuery(where);
  return updateQuery;
};

/**
 * to build DELETE query
 * @param tableName
 * @param where
 * @returns {string}
 */
const buildDeleteQuery = (tableName, where) => {
  let deleteQuery = `DELETE FROM \`${tableName}\``;
  deleteQuery += buildWhereQuery(where);
  return deleteQuery;
};

/**
 * to build SELECT query
 * @param tableName
 * @param where
 * @param orderBy
 * @param limit
 * @param offset
 * @returns {string}
 */
const buildSelectQuery = (tableName = '', where = [], orderBy = [], limit = GLOBAL_MYSQL_LIMIT, offset = GLOBAL_MYSQL_OFFSET) => {
  let selectQuery = `SELECT * FROM \`${tableName}\``;
  selectQuery += buildWhereQuery(where);
  selectQuery += buildOrderByQuery(orderBy);
  selectQuery += buildLimitQuery(limit);
  selectQuery += buildOffsetQuery(offset);
  return selectQuery;
};

/**
 * to build create table query
 * @param tableName
 * @param columns
 * @returns {string}
 */
const buildCreateTableQuery = (tableName, columns) => {
  let createTableQuery = `CREATE TABLE \`${tableName}\` (`;
  let keys = Object.keys(columns);
  let values = keys.map(key => columns[key]);
  createTableQuery += `${keys.join(', ')}`;
  createTableQuery += `) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
  return createTableQuery;
};


module.exports = {
  buildLimitQuery,
  buildWhereQuery,
  buildOffsetQuery,
  buildOrderByQuery,
  buildInsertQuery,
  buildUpdateQuery,
  buildDeleteQuery,
  buildSelectQuery
};