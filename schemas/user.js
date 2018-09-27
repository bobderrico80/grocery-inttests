const { commonProperties, createObjectType, stringType } = require('./common');

module.exports = createObjectType({
  ...commonProperties,
  email: stringType,
  name: stringType,
});
