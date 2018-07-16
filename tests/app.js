const chakram = require('chakram');
const { API_URL } = require('../lib/constants');
const packageJson = require('../package.json');

const { expect } = chakram;

describe('general application routes', () => {
  let response;

  describe('GET /healthcheck endpoint', () => {
    before(async () => {
      response = await chakram.get(`${API_URL}/healthcheck`);
    });

    it('responds with a 204', () => expect(response).to.have.status(204));
  });

  describe('GET /version endpoint', () => {
    before(async () => {
      response = await chakram.get(`${API_URL}/version`);
    });

    it('responds with a 200', () => expect(response).to.have.status(200));

    it('responds with the current version', () =>
      expect(response).to.have.json({ version: packageJson.version }));
  });
});
