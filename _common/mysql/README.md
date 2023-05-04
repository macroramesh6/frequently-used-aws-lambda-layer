#### models
each file represents the table name in the mysql database.

#### utils/querybuilder
To build the query, mostly imported in the models

#### index.js
extend the export by including the models/{table}

### Example usage from Lambda JS:
```
const pelMysql = require('/opt/mysql');

const db = pelMysql.connectToDatabase({
    host: 'localhost',
    user: 'root',
    password: 'example',
    database: 'pel',
    port: 3306
});

let users = pelMysql.get_all_users(db, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});
```