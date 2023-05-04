#### models
each file represents the collections/models name in the mongo database.

#### index.js
extend the export by including the models/{collections}

### Example usage from Lambda JS:
```
  const db = await pelMongo.connectToDatabase({
    MONGODB_URI: 'Connection String',
    MONGODB_DATABASE: 'Database Name'
  });

  let users = pelMongo.findAllUsers(db);
  console.log(users);
```