let dot = require('dot-object');


/**
 * This function will transform the incoming values received on data onto the outgoing mapped values, returning a JSON object.
 * @param data Values required for transformations
 * @param model Models required to say how the values need to be transformed. Property `transformation` and `originKey` is must
 * @returns {{}|*}
 */
const parseFields = (data = {}, model = {}) => {

  //validate the parameter
  if (typeof data !== 'object' || typeof model !== 'object')
    return {};

  // declare the mapped value to return
  let mappedData = {};

  //transformation function
  let makeTransformations = function (data, model, parent = '') {

    if (typeof model !== 'object')
      return null;

    //loop all the keys in the model
    for (let modelKey in model) {

      //return if the key is the property of the model. eg: __proto__, [[Prototype]] etc.,
      if (!model.hasOwnProperty(modelKey))
        continue;

      //each model
      let currentModel = model[modelKey];

      // if the model has sub model
      if (typeof currentModel === 'object' && !currentModel.transformation && !currentModel.originKey) {
        makeTransformations(data, currentModel, parent + modelKey + '.');
      } else {

        //if model doesn't has sub model
        try {
          mappedData[parent + modelKey] = currentModel.transformation(data);
        } catch (e) {
          // set `null` if transformation doesn't exist or error during the transformation
          mappedData[parent + modelKey] = null;
        }
      }
    }

  };

  // call transformation. return value is doted object eg: { 'depth0.depth1.depth2':valueOfDepth2 }
  makeTransformations(data, model);

  //make the proper object from the doted object. result is {depth0: {depth1: depth2: 'valueOfDepth2'}}
  return dot.object(mappedData); //make it nested object
};

module.exports = {
  parseFields
};
