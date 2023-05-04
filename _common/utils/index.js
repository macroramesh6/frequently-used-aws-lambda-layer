const {stringify} = require('flatted');
const countriesQuery = require("countries-code");
const config = require("../config");
const awslambda = require("../lambda");
const lookup = require("country-data").lookup;

/**
 * Access object with key as a dot notation.
 * @param obj Eg object is {depth0: {depth1: depth2: 'valueOfDepth2'}}
 * @param key string of 'depth0.depth1.depth2'
 * @returns {*} values of obj.depth0.depth1.depth2
 */
const getObjectByString = (obj, key) => {
    const keys = key.split('.');
    let temp = obj;
    for (let i = 0; i < keys.length; i++) {
        temp = temp[keys[i]];
    }
    return temp;
};

/**
 * Get value from object or return null
 * @param _value
 * @param path
 * @returns {*|null}
 */
const getValueOrNull = (_value, path) => {
    try {
        let value = { ..._value }
        // check that the value has a value
        if (!value || !Object.keys(value).length || value === "") {
            return null
        }
        return path.split(/\].|\]\[|\[|\./) // split on [] or .
          .map(el => el.replace(/\]$/, '')
            //In case you want to parse an ESCAPE propertie with [] or . in the name, you should use
            // () instead of [] and , instead of .
            .replace("(", "[").replace(")", "]").replace(",", "."))
            .reduce((obj, el) => (obj && typeof (obj) !== 'undefined' && obj[el]) ? obj[el] : null, value);
        } catch (e) {
        console.log(e);
        throw `Error trying to get Path: ${path} in value`;
    }
};

/**
 * To run bulk of promise collector without batch size
 * @param elements
 * @param fn
 * @param params
 * @returns {Promise<Awaited<unknown>[]>}
 */
const promisesCollector = (elements, fn, params) => {
    // set vars
    let promises = []

    // validations
    if (!Array.isArray(elements) || elements.length < 1) {
        // throw error
        throw 'Wrong input data'
    }

    // iterate over every element
    for (let element of elements) {
        // push the promise to the array of promises
        promises.push(fn(element, params))
    }

    // return promises result as a promise
    return Promise.all(promises)
}

/**
 * To run bulk of promise collector with batch size
 * @param elements
 * @param fn
 * @param params
 * @param batchSize
 * @returns {Promise<void>}
 */
const batchPromiseCollector = async (elements, fn, params = {}, batchSize= 10) => {
    for (let i = 0; i < elements.length; i += batchSize) {
        const requests = elements.slice(i, i + batchSize).map((item) => {
            if (item && typeof item === 'object') {
                return fn({...item, ...params});
            } else {
                return fn(item, params);
            }
        })
        await Promise.all(requests);
    }
};

/**
 * To run batch of promise collector with Index and batch size
 * @param elements
 * @param fn
 * @param params
 * @param batchSize
 * @returns {Promise<void>}
 */
const batchPromiseCollectorWithIndex = async (elements, fn, params = {}, batchSize= 10) => {
    for (let i = 0; i < elements.length; i += batchSize) {
        const requests = elements.slice(i, i + batchSize).map((item, index) => {
            return fn(item, i + index, params);
        })
        await Promise.all(requests);
    }
};

/**
 * Group an array of objects by a property
 * @param array
 * @param key
 * @returns {{}}
 */
const groupBy = (array, key) => {
    // set vars
    let result = {}

    // validations
    if (!Array.isArray(array) || array.length < 1) {
        // throw error
        throw 'Wrong input data'
    }

    // iterate over every element
    for (let element of array) {
        // set the key
        let keyValue = element[key]

        // if the key is not set
        if (!keyValue) {
            // throw error
            throw 'Wrong input data'
        }

        // if the key is not set
        if (!result[keyValue]) {
            // set the key
            result[keyValue] = []
        }

        // push the element to the array of elements
        result[keyValue].push(element)
    }

    // return the result
    return result
}

/**
 * To generate UUID
 * @param length
 * @returns {string}
 */
const generateUuid = (length = 8) => {
    // create string of a fixed length
    let value = new Array(length + 1).join("x");
    return value.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * To sleep for a while
 * @param ms
 * @returns {Promise<unknown>}
 */
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports = {
  getValueOrNull,
  getObjectByString,
  sleep,
  promisesCollector,
  batchPromiseCollector,
  batchPromiseCollectorWithIndex,
  groupBy,
  generateUuid
};
