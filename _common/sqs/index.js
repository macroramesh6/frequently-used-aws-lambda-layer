const AWS = require('aws-sdk');
const config = require('../config');
const validator = require('../validator');


const sendSQSMessage = (message, queueUrl, isFIFOQueue = true) => {
    return new Promise(async (resolve, reject) => {
        try {

            const awsCredentials = await config.get('awsCredentials');
            let environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'develop';

            const sqs = new AWS.SQS({
                region: awsCredentials.region,
                accessKeyId: awsCredentials.accessKeyId,
                secretAccessKey: awsCredentials.secretAccessKey
            });

            const params = {
                MessageBody: JSON.stringify(message),
                QueueUrl: queueUrl,
            };

            //MessageGroupId is not required for non fifo queue
            if(isFIFOQueue){
                params.MessageGroupId = environment;
            }

            sqs.sendMessage(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        } catch (e) {
            reject(e.message ? e.message : e);
        }
    });
};


const saveJobEvent = (document = {}) => {
    return new Promise(async (resolve, reject) => {
        try {

            //validate
            let jobEvent = validator.validate(document, 'jobEvent');

            let queue = await config.get('microservices.sqs.jobEvent');
            let environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'develop';

            // send message
            sendSQSMessage({
                document: jobEvent,
                environment: environment
            }, queue)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                });
        } catch (e) {
            reject(e.message ? e.message : e);
        }
    });
};


const saveIntegrationMessages = (document = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            //validate
            let integrationMessages = validator.validate(document, 'integrationMessages');

            let queue = await config.get('microservices.sqs.integrationMessage');
            let environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'develop';

            // send message
            sendSQSMessage(integrationMessages, queue, false)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                });
        } catch (e) {
            reject(e.message ? e.message : e);
        }
    });
};

// export
module.exports = {
    saveJobEvent,
    saveIntegrationMessages
};

