const AWS = require("aws-sdk");

/**
 * @param payload {Object} Input should be Object or JSON Stringified
 * @param functionName {String} lambda function name
 * @returns {Promise<unknown>} Returns the result of the lambda function
 */
const invoke = (payload, functionName) => {
    return new Promise((resolve, reject) => {
        console.log("invoke function on shared layer its deprecated, use intead invokeLambda");
        if (
            typeof payload === "object" &&
            !Array.isArray(payload) &&
            payload !== null
        ) {
            payload = JSON.stringify(payload)
        }
        let lambda = new AWS.Lambda({
            httpOptions: {
                timeout: 900000,
            },
        });
        let params = {
            FunctionName: functionName,
            Payload: payload,
        };
        lambda.invoke(params, function (err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(JSON.parse(data.Payload));
            }
        });
    });
};

const invokeLambda = (payload, functionName, options = {}) => {
    return new Promise((resolve, reject) => {
        let {timeout, maxCount} = options;

        let lambda = new AWS.Lambda(
          {
              httpOptions: {
                  timeout: timeout || 900000,
              }
          }
        );
        let params = {
            FunctionName: functionName,
            Payload: payload
        };

        // invoke lambda, if err is retryable invoke the call again
        let retryCount = 0;
        maxCount = maxCount !== undefined && maxCount !==null ? maxCount : 2;

        const invoke = () => {
            lambda.invoke(params, async (err, data) => {
                if (err) {
                    if (err.retryable) { // error properties https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Response.html#error-property
                        if (retryCount < maxCount) {
                            await Tools.sleep(15000);  //wait 15 sec
                            retryCount++;
                            invoke();
                        } else {
                            reject(err);
                        }
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(JSON.parse(data.Payload));
                }
            });
        };
        invoke();
    });
};

//export
module.exports = {
    invoke, // deprecated => dont use
    invokeLambda
};
