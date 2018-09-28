const { API_URL } = require('../lib/constants');
const { describeRestEndpoint, saveBodyToState } = require('../lib/restTests');
const { post } = require('../lib/restUtils');
const userSchema = require('../schemas/user');
const { tokenSchema } = require('../schemas/auth');

const authRoute = `${API_URL}/auth`;
const register = post(`${authRoute}/register`);
const login = post(`${authRoute}/login`);

describe('/auth routes', () => {
  const credentials = {
    email: 'authorized@user.com',
    password: 'P@$$w0rd',
  };

  const newUser = {
    email: credentials.email,
    name: 'Authorized Test User',
  };

  describeRestEndpoint('POST /register', [
    {
      description: 'happy path',
      callEndpoint: () => register({ ...newUser, password: credentials.password }),
      statusCode: 201,
      responseBody: newUser,
      schema: userSchema,
      saveToSave: saveBodyToState('authorizedTestUser'),
    },
  ]);

  describeRestEndpoint('POST /login', [
    {
      description: 'happy path',
      callEndpoint: () => login(credentials),
      statusCode: 200,
      schema: tokenSchema,
      saveToState: { key: 'userToken', value: response => response.body.token },
    },
    {
      description: 'incorrect user',
      callEndpoint: () => login({ ...credentials, email: 'not@valid.com' }),
      statusCode: 401,
    },
    {
      description: 'incorrect password',
      callEndpoint: () => login({ ...credentials, password: 'not_valid' }),
      statusCode: 401,
    },
  ]);
});
