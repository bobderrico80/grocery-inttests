const { commonProperties, requireAll, stringType } = require('./common');

const properties = {
  ...commonProperties,
  name: stringType,
};

module.exports = {
  type: 'object',
  properties,
  required: requireAll(properties),
};
