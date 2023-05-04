const config = require('../config');
const RDSConnection = require('./connect-to-rdsdb');
const queryBuilder = require('./utils/queryBuilder');
const {getValueOrNull} = require('../utils/index');
/**
 * To connect RDS Database. It's always mysql present in out AWS
 * @param path
 * @returns db connection
 */
const connectMyRDS = async (databaseName) => {
    try {
        const dbParams = await config.get(databaseName, 'rds');

        if (!dbParams) {
            throw new Error('Database name is not valid in the Secret Manager');
        }

        dbParams.database = databaseName;
        dbParams.port = dbParams.port || 3306;

        const connection = await RDSConnection.connectToDatabase(dbParams);
        return connection;
    } catch (error) {
        throw error;
    }

};

//export
module.exports = {
    connectMyRDS,
    ...queryBuilder
}