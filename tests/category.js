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
const schema = require('../schemas/category');

const categoryRoute = `${API_URL}/category`;

const postCategory = post(categoryRoute);
const getCategory = get(categoryRoute);
const putCategory = put(categoryRoute);
const deleteCategory = del(categoryRoute);

const withUser = withAuthorization('userToken');

describe('/category routes', () => {
  const newCategory = { name: 'dairy' };
  const additionalCategory = { name: 'Bakery' };
  const updatedCategory = { name: 'Dairy' };

  describeRestEndpoint('POST /category', [
    {
      description: 'happy path',
      callEndpoint: () => postCategory(newCategory, withUser()),
      statusCode: 201,
      responseBody: newCategory,
      schema,
    },
    {
      description: 'with existing category',
      callEndpoint: () => postCategory(newCategory, withUser()),
      statusCode: 409,
    },
    {
      description: 'with no name',
      callEndpoint: () => postCategory({}, withUser()),
      statusCode: 400,
    },
  ]);

  describeRestEndpoint('GET /category', [
    {
      description: 'happyPath',
      callEndpoint: () => getCategory('', withUser()),
      statusCode: 200,
      schema: arrayOf(schema),
      additionalAssertions: [assertResponseLengthOf(1)],
    },
    {
      description: 'with multiple categories',
      setup: () => postCategory(additionalCategory, withUser()),
      callEndpoint: () => getCategory('', withUser()),
      statusCode: 200,
      schema: arrayOf(schema),
      additionalAssertions: [assertResponseLengthOf(2)],
      saveToState: saveBodyToState('allCategories'),
    },
  ]);

  describeRestEndpoint('GET /category/:id', [
    {
      description: 'happy path',
      callEndpoint: state => getCategory(state.allCategories[0].id, withUser()),
      statusCode: 200,
      schema,
      responseBody: state => state.allCategories[0],
    },
    {
      description: 'with unknown ID',
      callEndpoint: () => getCategory('0', withUser()),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('PUT /category/:id', [
    {
      description: 'happy path',
      callEndpoint: state => putCategory(state.allCategories[0].id, updatedCategory, withUser()),
      statusCode: 200,
      responseBody: updatedCategory,
      schema,
      additionalAssertions: [
        assertResourceUpdated(
          state => getCategory(state.allCategories[0].id, withUser()),
          updatedCategory,
        ),
      ],
    },
    {
      description: 'with updating to a conflicting name',
      callEndpoint: state => putCategory(state.allCategories[0].id, additionalCategory, withUser()),
      statusCode: 409,
    },
    {
      description: 'with non-existent category',
      callEndpoint: () => putCategory(0, updatedCategory, withUser()),
      statusCode: 404,
    },
  ]);

  describeRestEndpoint('DELETE /category/:id', [
    {
      description: 'happy path',
      callEndpoint: state => deleteCategory(state.allCategories[0].id, withUser()),
      statusCode: 204,
      additionalAssertions: [
        assertResourceDeleted(state => getCategory(state.allCategories[0].id, withUser())),
      ],
    },
    {
      description: 'with a non-existent category',
      callEndpoint: () => deleteCategory(0, withUser()),
      statusCode: 404,
    },
  ]);
});
