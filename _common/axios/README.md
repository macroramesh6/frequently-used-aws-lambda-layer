### Example usage from Lambda JS:

```javascript
    let result = await pelRequest.get('https://api.sampleapis.com/coffee/hot', {
      "auth": {
        "test": "test"
      },
      "logId": "apiGateway/microservices",
      "payload": []
    });

    console.log(result.data);

```

#### Example SOAP usage from Lambda JS:
```javascript
let result = await pelRequest.sendSoapRequest('http://www.gcomputer.net//webservices/dilbert.asmx', {
    "auth": {
        "test": "test"
    },
    "logId": "apiGateway/microservices",
    "payload": xml,
    "headers": {
        "SOAPAction": "http://gcomputer.net/webservices/DailyDilbert"
    }
});

console.log(result);
```