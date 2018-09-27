/**
 * Provides common JSON schema types and helper functions.
 * @module schemas/common
 */

/**
 * Defines a string type JSON schema.
 */
const stringType = { type: 'string' };

/**
 * Defines an integer type JSON schema.
 */
const integerType = { type: 'integer' };

/**
 * Defines common properties that should exist on all JSON schema types.
 */
const commonProperties = {
  id: integerType,
  createdAt: stringType,
  updatedAt: stringType,
};

/**
 * Wraps an array type schema around the provided schema, using the provided schema as the `items`
 * property of the array type.
 * @param {object} type The JSON schema type to wrap.
 * @return {object} The array type JSON schema.
 */
const arrayOf = type => ({ type: 'array', items: type });

/**
 * A convenience function to get all of the JSON schema properties to pass to the `required`
 * property of a JSON schema. This is useful for schemas where all properties are required.
 * @param {object} properties An object containing all of the properties in the schema.
 * @return {string[]} An array of all of the object properties.
 */
const requireAll = properties => Object.keys(properties);

/**
 * A convenience function for creating an object type with the given properties and required and/or
 * additional property configuration.
 * @param {object} properties An object containing all of the properties in the schema
 * @param {boolean|string[]} requiredProperties (Default: true) Value which properties are required.
 * If false, no properties will be required. If an array, the array will be added as a `required`
 * property on the resultant schema. Otherwise, all defined properties will be required
 * @param {boolean} additionalProperties (Default: false) Whether additional properties are allowed
 * on the schema.
 */
const createObjectType = (properties, requiredProperties = true, additionalProperties = false) => {
  const schema = {
    type: 'object',
    properties,
    additionalProperties,
  };

  if (!requiredProperties) {
    return schema;
  }

  if (Array.isArray(requiredProperties)) {
    return { ...schema, required: requiredProperties };
  }

  return { ...schema, required: requireAll(properties) };
};

module.exports = {
  arrayOf,
  commonProperties,
  createObjectType,
  integerType,
  requireAll,
  stringType,
};
