const { commonProperties, requireAll, stringType } = require('./common');

const properties = {
  ...commonProperties,
  name: stringType,
};

module.exports = {
  type: 'object',
  properties,
  additionalProperties: false,
  required: requireAll(properties),
};
