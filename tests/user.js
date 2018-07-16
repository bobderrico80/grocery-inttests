const chakram = require('chakram');
const { API_URL } = require('../lib/constants');

const { expect } = chakram;
const userRoute = `${API_URL}/user`;

describe('/user routes', () => {
  let response;

  describe('POST /user endpoint', () => {
    const newUser = {
      email: 'test@test.com',
      name: 'Test User',
    };

    before(async () => {
      response = await chakram.post(userRoute, newUser);
    });

    it('responds with a 204 status code', () => expect(response).to.have.status(201));

    it('responds with the newly-created user', () => expect(response).to.comprise.of.json(newUser));
  });
});
