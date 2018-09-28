const { API_URL } = require('../lib/constants');
const {
  assertResourceDeleted,
  assertResourceUpdated,
  assertResponseLengthOf,
  describeRestEndpoint,
  saveBodyToState,
  withAuthorization,
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

const withUser = withAuthorization('userToken');

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
      callEndpoint: () => postUser({ ...newUser, password }, withUser()),
      statusCode: 201,
      responseBody: newUser,
      schema,
    },
    {
      description: 'with existing user',
      callEndpoint: () => postUser({ ...newUser, password }, withUser()),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: () => postUser({ ...newUser, password, email: 'not.an.email' }, withUser()),
      statusCode: 400,
    },
    {
      description: 'with no email',
      callEndpoint: () => postUser({ password, name: 'No Email' }, withUser()),
      statusCode: 400,
    },
    {
      description: 'with no name',
      callEndpoint: () => postUser({ password, email: 'no@name.com' }, withUser()),
      statusCode: 400,
    },
    {
      description: 'with no password',
      callEndpoint: () => postUser({ name: 'No Password', email: 'no@password.com' }, withUser()),
      statusCode: 400,
    },
  ]);

  describeRestEndpoint('GET /user', [
    {
      description: 'happy path',
      callEndpoint: () => getUser(undefined, withUser()),
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
      callEndpoint: state => getUser(state.allUsers[0].id, withUser()),
      statusCode: 200,
      schema,
      responseBody: state => state.allUsers[0],
    },
    {
      description: 'with unknown ID',
      callEndpoint: () => getUser('0', withUser()),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('PUT /user/:id', [
    {
      description: 'happy path',
      // Update the user we created in this test suite
      callEndpoint: state =>
        putUser(state.allUsers[1].id, { password, ...updatedUser }, withUser()),
      statusCode: 200,
      responseBody: updatedUser,
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[1].id, withUser()), updatedUser),
      ],
    },
    {
      description: 'with partial property update behavior',
      callEndpoint: state => putUser(state.allUsers[1].id, partiallyUpdatedUser, withUser()),
      statusCode: 200,
      responseBody: { ...updatedUser, ...partiallyUpdatedUser },
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[1].id, withUser()), {
          ...updatedUser,
          ...partiallyUpdatedUser,
        }),
      ],
    },
    {
      description: 'with updating to a conflicting email',
      // Attempt to change email to the user created in the auth test suite
      callEndpoint: state =>
        putUser(
          state.allUsers[1].id,
          { ...updatedUser, password, email: 'authorized@user.com' },
          withUser(),
        ),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: state =>
        putUser(
          state.allUsers[1].id,
          { ...updatedUser, password, email: 'not.an.email' },
          withUser(),
        ),
      statusCode: 400,
    },
    {
      description: 'with non-existent user',
      callEndpoint: () => putUser(0, updatedUser, withUser()),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('DELETE /user/:id', [
    {
      // Delete the user we created in this test
      description: 'happy path',
      callEndpoint: state => deleteUser(state.allUsers[1].id, withUser()),
      statusCode: 204,
      additionalAssertions: [
        assertResourceDeleted(state => getUser(state.allUsers[1].id, withUser())),
      ],
    },
    {
      description: 'with a non-existent user',
      callEndpoint: () => deleteUser(0, withUser()),
      statusCode: 404,
    },
  ]);
});
