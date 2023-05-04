let AWS = require('aws-sdk');
const config = require('../config');

// generate uuid v4
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

if (!global.LOG_STREAM_NAME) {
    global.LOG_STREAM_NAME = `${process.env.AWS_LAMBDA_FUNCTION_NAME}-${process.env.AWS_LAMBDA_LOG_STREAM_NAME}-${uuidv4()}`;
}

/**
 * To add logs in the cloudwatch. logStreamName should be present in the cloudwatch with right permisions to add logs.
 * @param logEvents logEvents is the log events.
 * @param logGroupName logGroupName is the name of the log group.
 * @param logLevel logLevel is the level of the log. If 0 no log will be saved, 1 - debug, 2 - information, 3 - warning, 4 - error, 5 - critical. Default is 2.
 * @param logStreamName logStreamName is the name of the log stream. If it's not passing in the parameter, will use global.LOG_STREAM_NAME.
 * @returns {Promise<unknown>}
 */
const putLogEvents = (logEvents = [], logGroupName, logLevel = 2, logStreamName = null) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (logLevel === 0) {
                return resolve();
            }

            if (!logGroupName) {
                return reject('logEvents and logGroupName are required');
            }

            // login to aws
            let awsCredentials = await config.get('awsCredentials');

            // check log group exists
            /*let cloudwatchlogs = new AWS.CloudWatchLogs({
                apiVersion: '2014-03-28',
                region: awsCredentials.region,
                accessKeyId: awsCredentials.accessKeyId,
                secretAccessKey: awsCredentials.secretAccessKey
            });
            let describeloggroups = await cloudwatchlogs.describeLogGroups({
                logGroupNamePrefix: logGroupName
            }).promise();
            if (describeloggroups.logGroups.length === 0) {
                return reject(`Log group ${logGroupName} does not exist`);
            }*/

            //Make array if the logEvents is string
            Array.isArray(logEvents) || (logEvents = [String(logEvents)]);

            if (logEvents.length < 0) {
                return reject('Empty log event');
            }

            switch (logLevel) {
                case 0:
                    logLevel = 'OFF';
                    break;
                case 1:
                    logLevel = 'DEBUG';
                    break;
                case 2:
                    logLevel = 'INFO';
                    break;
                case 3:
                    logLevel = 'WARN';
                    break;
                case 4:
                    logLevel = 'ERROR';
                    break;
                case 5:
                    logLevel = 'CRITICAL';
                    break;
                default:
                    logLevel = 'INFO';
            }

            //prepare logs to save in the cloudwatch
            let cloudWatchLogEvents = [];
            let maxBytes = 200000; // cloudwatch actual limitation is 262144 and sqs limitation is 256000
            for (let i = 0; i < logEvents.length; i++) {
                let logEvent = logEvents[i];

                //If exceed the CW limit. split the log event
                if (logEvent.length > maxBytes) {
                    for (let j = 0; j < logEvent.length; j += maxBytes) {
                        let logEventChunk = logEvent.substring(j, j + maxBytes);
                        cloudWatchLogEvents.push({
                            message: `${logLevel} ${logEventChunk}`,
                            timestamp: new Date().getTime()
                        });
                    }

                    // if log event is within the CW limit
                } else {
                    //prepare logs to save in the cloudwatch
                    cloudWatchLogEvents.push({
                        message: `${logLevel} ${logEvent}`,
                        timestamp: new Date().getTime()
                    })
                }

            }


            // send logEvents to the SQS queue to deliver it to cloudwatch
            let sqs = new AWS.SQS({
                accessKeyId: awsCredentials.accessKeyId,
                region: awsCredentials.region,
                secretAccessKey: awsCredentials.secretAccessKey
            });

            //send each cloudWatchLogEvents to SQS
            let errors = [];
            let sqsMessage = [];
            for (let i = 0; i < cloudWatchLogEvents.length; i++) {
                let sqsParams = {
                    MessageBody: JSON.stringify({
                        logEvents: [cloudWatchLogEvents[i]],
                        logGroupName: logGroupName,
                        logStreamName: logStreamName || global.LOG_STREAM_NAME,
                        logLevel: logLevel
                    }),
                    QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/826419745875/tookane_SQS_save_log_on_cloudwatch'
                    // MessageGroupId: logStreamName || global.LOG_STREAM_NAME,
                };

                try {
                    sqsMessage.push(await sqs.sendMessage(sqsParams).promise());
                } catch (e) {
                    errors.push(e);
                }
            }

            // if any errors
            if (errors.length > 0) {
                return reject(errors);
            }
            // if no errors
            return resolve(sqsMessage);

        } catch
            (e) {
            return reject(e);
        }
    });
};

module.exports = {
    putLogEvents
};
