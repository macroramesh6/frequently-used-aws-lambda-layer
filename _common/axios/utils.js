const xml2js = require('xml2js');

/**
 * convert xml to JSON
 * @param dataXml
 * @param options
 * @returns {Promise<*>}
 */

 const XMLToJSON = async (dataXml, options) =>{
    try{
        return xml2js.parseStringPromise(dataXml,options);
    }catch(err){
        throw err;
    }
}

/**
 * convert JSON to XML
 * @param dataJson
 * @param options
 * @returns {Promise<*>}
 */
 const JSONToXML = async (dataJson, options) =>{
    try{
        let builder = new xml2js.Builder(); 
        return builder.buildObject(dataJson);
    }catch(err){
        throw err
    }
}


module.exports = {
    XMLToJSON,
    JSONToXML
}