const { createObjectType, stringType } = require('./common');

const tokenSchema = createObjectType({
  token: stringType,
});

module.exports = { tokenSchema };
