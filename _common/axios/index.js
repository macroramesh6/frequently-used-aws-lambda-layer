const axios = require('axios');
const Joi = require('joi');
const cloudwatch = require('../cloudwatch');

// set axios defaults
axios.defaults.timeout = 120000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.get['Accept'] = 'application/json';
axios.defaults.headers.put['Accept'] = 'application/json';
axios.defaults.headers.patch['Accept'] = 'application/json';

/**
 * Joi schema validation for request param
 * @type {Joi.ObjectSchema<any>}
 */
const paramSchema = Joi.object({
    'logId': Joi.string().max(150).required().trim(), //this for us to store the request in the cloduwatch
    'payload': Joi.alternatives().try(Joi.array(), Joi.object(), Joi.string()).optional(), // this for the marketplace or 3rd party
    'config': Joi.object().optional(), // this to config the axios
    'headers': Joi.object().optional() // this to set/configure the headers like auth or anything
});

/**
 * validate params against paramSchema
 * @param params Object request param
 * @returns {any} Object of valid param or Joi's error validation message
 */
const validateParams = (params) => {
    let result = paramSchema.validate(params, { abortEarly: false, stripUnknown: true });
    if (result.error) {
        throw new Error(result.error.message);
    }
    return result.value;
};

/**
 * list of things before makes axios request
 * @param url
 * @param params
 * @returns {Promise<void>}
 * @private
 */
const _beforeRequestHook = async (url, params) => {
    // Do something before request is sent
    await cloudwatch.putLogEvents(JSON.stringify(params), params.logId);
};

/**
 * list of this after axios SUCCESS response
 * @param url
 * @param params
 * @param response
 * @returns {Promise<void>}
 * @private
 */
const _afterRequestSuccessHook = async (url, params, response) => {
    // Do something after request is sent
    let logValue = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: response.config,
        data: response.data
    });

    await cloudwatch.putLogEvents(logValue, params.logId);
};

/**
 * list of this after axios ERROR response
 * @param url
 * @param params
 * @param response
 * @returns {Promise<void>}
 * @private
 */
const _afterRequestErrorHook = async (url, params, response) => {
    // Do something after request is sent
    let logValue = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: response.config,
        data: response.data,
        isAxiosError: response.isAxiosError,
        message: response.message,
        stack: response.stack
    });

    await cloudwatch.putLogEvents(logValue, params.logId);
};

/**
 * filter payload from params
 * @param params
 * @returns {*[]}
 * @private
 */
const _preparePayload = (params) => {
    return params.payload || '';
};

/**
 * Make axios request
 * @param url
 * @param params
 * @param method
 * @returns {Promise<unknown>}
 */
const request = (url, params, method) => {
    return new Promise(async (resolve, reject) => {
        //validate
        let validParam = validateParams(params);

        let configurationParams = {};

        //steps before making request
        await _beforeRequestHook(url, validParam);

        //prepare payload
        let payload = _preparePayload(validParam);
        // console.log(`${method} ${url}`, payload);

        // if any custom headers are required, add them to the request
        if (validParam.headers) {
            configurationParams['headers'] = validParam.headers;
        }

        // add config params
        if (validParam.config) {
            configurationParams = {
                ...configurationParams,
                ...validParam.config
            }
        }

        //lets make axios request
        axios[method](url, payload, configurationParams).then(async function (response) {

            //success request
            await _afterRequestSuccessHook(url, validParam, response);
            resolve(response);
        })
            .catch(async function (error) {

                //error response
                await _afterRequestErrorHook(url, validParam, error);
                reject(error);
            });
    });
};

/**
 * Make axios request
 * @param url
 * @param params
 * @param method
 * @returns {Promise<unknown>}
 */
const getRequest = (url, params, method) => {
    return new Promise(async (resolve, reject) => {
        //validate
        let validParam = validateParams(params);

        let configurationParams = {};

        //steps before making request
        await _beforeRequestHook(url, validParam);

        //prepare payload
        let payload = _preparePayload(validParam);
        // console.log(`${method} ${url}`, payload);

        // if any custom headers are required, add them to the request
        if (validParam.headers) {
            configurationParams['headers'] = validParam.headers;
        }

        // add config params
        if (validParam.config) {
            configurationParams = {
                ...configurationParams,
                ...validParam.config
            }
        }

        //lets make axios request
        axios[method](url, configurationParams).then(async function (response) {

            //success request
            await _afterRequestSuccessHook(url, validParam, response);
            resolve(response);
        })
          .catch(async function (error) {

              //error response
              await _afterRequestErrorHook(url, validParam, error);
              reject(error);
          });
    });
};

/**
 * GET request handler
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
const get = async (url, params) => {
    return await getRequest(url, params, 'get');
};

/**
 * POST method handler
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
const post = async (url, params) => {
    return await request(url, params, 'post');
};

/**
 * PUT request handler
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
const put = async (url, params) => {
    return await request(url, params, 'put');
};

/**
 * PATCH request handler
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
const patch = async (url, params) => {
    return await request(url, params, 'patch');
};


const sendSoapRequest = async (url, params) => {
    //default headers
    const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
    };
    params.headers = Object.assign(params.headers, headers);
    /*If you need to add aditional header. Add it in the params
    eg header params
    {
        "auth": {
            ...
        },
        "logId": "...",
        "payload": xml,
        "headers": {
            "SOAPAction": "http://gcomputer.net/webservices/DailyDilbert"
        }
    }*/

    return await post(url, params);
}

// export the request handler
module.exports = {
    get,
    post,
    put,
    patch,
    sendSoapRequest
};
