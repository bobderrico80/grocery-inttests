/* eslint-disable global-require */
describe('The grocery API', () => {
  require('./tests/app');
  require('./tests/auth');
  require('./tests/user');
  require('./tests/category');
});
