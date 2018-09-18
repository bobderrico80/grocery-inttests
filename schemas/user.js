const { integerType, requireAll, stringType } = require('./common');

const properties = {
  id: integerType,
  email: stringType,
  name: stringType,
  createdAt: stringType,
  updatedAt: stringType,
};

module.exports = {
  type: 'object',
  properties,
  required: requireAll(properties),
};
