const chakram = require('chakram');
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

const { expect } = chakram;
const userRoute = `${API_URL}/user`;

const postUser = post(userRoute);
const getUser = get(userRoute);
const putUser = put(userRoute);
const deleteUser = del(userRoute);

const createUser = async (newUser) => {
  const response = await postUser(newUser);
  expect(response).to.have.status(201);
};

describe('/user routes', () => {
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

  describeRestEndpoint('POST /user endpoint', [
    {
      description: 'happy path',
      callEndpoint: () => postUser(newUser),
      statusCode: 201,
      responseBody: newUser,
      schema,
    },
    {
      description: 'with existing user',
      callEndpoint: () => postUser(newUser),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: () => postUser({ ...newUser, email: 'not.an.email' }),
      statusCode: 400,
    },
    {
      description: 'with no email',
      callEndpoint: () => postUser({ name: 'Just a name' }),
      statusCode: 400,
    },
    {
      description: 'with no name',
      callEndpoint: () => postUser({ email: 'test@test.com' }),
      statusCode: 400,
    },
  ]);

  describeRestEndpoint('GET /user endpoint', [
    {
      description: 'happy path',
      callEndpoint: () => getUser(),
      statusCode: 200,
      schema: arrayOf(schema),
      additionalAssertions: [assertResponseLengthOf(1)],
    },
    {
      description: 'with multiple users',
      setup: async () => createUser({ ...newUser, email: 'something@else.com' }),
      callEndpoint: () => getUser(),
      statusCode: 200,
      schema: arrayOf(schema),
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
      callEndpoint: state => putUser(state.allUsers[0].id, updatedUser),
      statusCode: 200,
      responseBody: updatedUser,
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[0].id), updatedUser),
      ],
    },
    {
      description: 'with partial property update behavior',
      callEndpoint: state => putUser(state.allUsers[0].id, partiallyUpdatedUser),
      statusCode: 200,
      responseBody: { ...updatedUser, ...partiallyUpdatedUser },
      schema,
      additionalAssertions: [
        assertResourceUpdated(state => getUser(state.allUsers[0].id), {
          ...updatedUser,
          ...partiallyUpdatedUser,
        }),
      ],
    },
    {
      description: 'with updating to a conflicting email',
      callEndpoint: state =>
        putUser(state.allUsers[0].id, { ...updatedUser, email: 'something@else.com' }),
      statusCode: 409,
    },
    {
      description: 'with invalid email address',
      callEndpoint: state =>
        putUser(state.allUsers[0].id, { ...updatedUser, email: 'not.an.email' }),
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
      description: 'happy path',
      callEndpoint: state => deleteUser(state.allUsers[0].id),
      statusCode: 204,
      additionalAssertions: [assertResourceDeleted(state => deleteUser(state.allUsers[0].id))],
    },
    {
      description: 'with non-existent user',
      callEndpoint: () => deleteUser(0),
      statusCode: 404,
    },
  ]);
});
