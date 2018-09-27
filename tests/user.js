const { API_URL } = require('../lib/constants');
const {
  assertResourceDeleted,
  assertResourceUpdated,
  assertResponseLengthOf,
  describeRestEndpoint,
  saveBodyToState,
} = require('../lib/restTests');
const {
  post, get, put, del,
} = require('../lib/restUtils');
const { arrayOf } = require('../schemas/common');
const schema = require('../schemas/user');

const userRoute = `${API_URL}/user`;

const postUser = post(userRoute);
const getUser = get(userRoute);
const putUser = put(userRoute);
const deleteUser = del(userRoute);

describe('/user routes', () => {
  const password = 'P@$$w0rd';

  const newUser = {
    email: 'test@test.com',
    name: 'Test User',
  };

  const updatedUser = {
    ...newUser,
    name: 'New Name',
  };

  const partiallyUpdatedUser = {
    name: 'Newer name',
  };

  describeRestEndpoint('POST /user', [
    {
      description: 'happy path',
      callEndpoint: () => postUser({ ...newUser, password }),
      statusCode: 201,
      responseBody: newUser,
      schema,
    },
    {
      description: 'with existing user',
      callEndpoint: () => postUser({ ...newUser, password }),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: () => postUser({ ...newUser, password, email: 'not.an.email' }),
      statusCode: 400,
    },
    {
      description: 'with no email',
      callEndpoint: () => postUser({ password, name: 'No Email' }),
      statusCode: 400,
    },
    {
      description: 'with no name',
      callEndpoint: () => postUser({ password, email: 'no@name.com' }),
      statusCode: 400,
    },
    {
      description: 'with no password',
      callEndpoint: () => postUser({ name: 'No Password', email: 'no@password.com' }),
      statusCode: 400,
    },
  ]);

  describeRestEndpoint('GET /user', [
    {
      description: 'happy path',
      callEndpoint: () => getUser(),
      statusCode: 200,
      schema: arrayOf(schema),
      // First user was created in auth test
      additionalAssertions: [assertResponseLengthOf(2)],
      saveToState: saveBodyToState('allUsers'),
    },
  ]);

  describeRestEndpoint('GET /user/:id', [
    {
      description: 'happy path',
      callEndpoint: state => getUser(state.allUsers[0].id),
      statusCode: 200,
      schema,
      responseBody: state => state.allUsers[0],
    },
    {
      description: 'with unknown ID',
      callEndpoint: () => getUser('0'),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('PUT /user/:id', [
    {
      description: 'happy path',
      // Update the user we created in this test suite
      callEndpoint: state => putUser(state.allUsers[1].id, { password, ...updatedUser }),
      statusCode: 200,
      responseBody: updatedUser,
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[1].id), updatedUser),
      ],
    },
    {
      description: 'with partial property update behavior',
      callEndpoint: state => putUser(state.allUsers[1].id, partiallyUpdatedUser),
      statusCode: 200,
      responseBody: { ...updatedUser, ...partiallyUpdatedUser },
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[1].id), {
          ...updatedUser,
          ...partiallyUpdatedUser,
        }),
      ],
    },
    {
      description: 'with updating to a conflicting email',
      // Attempt to change email to the user created in the auth test suite
      callEndpoint: state =>
        putUser(state.allUsers[1].id, { ...updatedUser, password, email: 'authorized@user.com' }),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: state =>
        putUser(state.allUsers[1].id, { ...updatedUser, password, email: 'not.an.email' }),
      statusCode: 400,
    },
    {
      description: 'with non-existent user',
      callEndpoint: () => putUser(0, updatedUser),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('DELETE /user/:id', [
    {
      // Delete the user we created in this test
      description: 'happy path',
      callEndpoint: state => deleteUser(state.allUsers[1].id),
      statusCode: 204,
      additionalAssertions: [assertResourceDeleted(state => getUser(state.allUsers[1].id))],
    },
    {
      description: 'with a non-existent user',
      callEndpoint: () => deleteUser(0),
      statusCode: 404,
    },
  ]);
});
