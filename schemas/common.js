const stringType = { type: 'string' };
const integerType = { type: 'integer' };

const arrayOf = type => ({ type: 'array', items: type });

const requireAll = properties => Object.keys(properties);

module.exports = {
  arrayOf,
  integerType,
  requireAll,
  stringType,
};
