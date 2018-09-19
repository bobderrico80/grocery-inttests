const { commonProperties, requireAll, stringType } = require('./common');

const properties = {
  ...commonProperties,
  email: stringType,
  name: stringType,
};

module.exports = {
  type: 'object',
  properties,
  required: requireAll(properties),
};
