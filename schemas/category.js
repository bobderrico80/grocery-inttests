const { commonProperties, createObjectType, stringType } = require('./common');

module.exports = createObjectType({
  ...commonProperties,
  name: stringType,
});
