const mysql = require('mysql');

const connectToDatabase = function (params) {
    return new Promise((resolve, reject) => {

        if (!params.host || !params.port || !params.user || !params.password || !params.database) {
            reject(new Error('Missing required parameters'));
        }

        let connection = mysql.createConnection({
            host: params.host,
            user: params.user,
            password: params.password,
            database: params.database,
            port: params.port,
            charset: 'utf8'
        });

        connection.connect(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });

    });

};

module.exports = {
    connectToDatabase
};