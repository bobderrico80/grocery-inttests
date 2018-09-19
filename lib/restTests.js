/**
 * A suite of related functions for testing individual REST endpoints, the main one being
 * {@link module:restTests.describeRestEndpoint}, which creates a test suite containing a number
 * of test scenarios to perform against the REST endpoint. For each scenario, common assertions,
 * such as status code, response body, and JSON schema can be performed. Additional, custom
 * assertions can also be performed. This module also contains a number of common additional
 * assertions that can be used.
 *
 * This module also has a {@link module:testTest~testState} object, designed to hold on to test data
 * during the duration of a test. This test state is passed to a number of callback functions on
 * a test scenario in order to compare data from previous test scenarios to the current scenario.
 * @module restTests
 */

const { expect } = require('chakram');

/**
 * @typedef {object} TestState An object containing the state of the test. This object allows
 * data to be shared between test suites.
 */

/**
 * @typedef {object} AdditionalAssertion An object describing an additional assertion to be made in
 * the test suite.
 * @property {string} assertionDescription The description of the assertion. Will be passed-in as
 * the description in the `it()` block.
 * @property {(response: object, testState: TestState) => void} assertionFunction The function to
 * perform the assertion. A Chakram `expect()` assertion should be performed in this function. The
 * function will be passed the Chakram response from the original call, as well as the
 * {@link TestState}.
 */

/**
 * @typedef {object} SaveToStateRequest An object describing how to save data to the
 * {@link TestState} object.
 * @property {string} key The key or property name of the state to save on {@link TestState}.
 * @property {*} value The value to save to the state. If a function is passed in, the function will
 * be called with the response object, and will return the value to save to the state.
 */

/**
 * @typedef {Object} TestScenario An object defining the properties of a REST test suite.
 * @property {string} description The description for the test case (will be used as the description
 * for an inner `describe()` block).
 * @property {(testState: TestState) => void} setup A function to perform any test setup. The
 * function will be passed the {@link TestState}, and will be called immediately before the
 * {@link TestState#callEndpoint}.
 * @property {(testState: TestState) => Promise<object>} callEndpoint A function that takes the test
 * `state` object, and returns a Promise resolving with the Chakram response. This function will
 * be called in a `before()` block, and its response will be saved for asserting the test cases.
 * @property {number} statusCode The HTTP status code to assert. Will be checked with
 * `expect(response).to.have.status(statusCode)`.
 * @property {object|((testState: TestState) => string)} [responseBody] (Optional) The expected
 * response body for the REST call. If provided, the body will be checked with an
 * `expect(response).to.comprise.of.json(responseBody)` assertion. If provided a function, the
 * function will be called with the {@link TestState} and should return the response body to assert.
 * @property {object} [schema] (Optional). A JSON schema, describing the response. If provided, will
 * be checked with `expect(response).to.have.schema(schema)`.
 * @property {AdditionalAssertion[]} [additionalAssertions = []] (Optional) Additional assertions to
 * make as part of the test suite, if provided.
 * @property {(testState: testState, response: object) => void} tearDown (Optional) A function to
 * perform any test cleanup. The function will be passed the {@link TestState} and the response
 * object, and will be called in an `after()` block.
 * @property {SaveToStateRequest} saveToState A {@link SaveToStateRequest} describing a request to
 * save data to the test state. This will be called in an `after()` block, after
 * {@link TestScenario#tearDown} is called.
 */

/**
 * @type TestState
 */
const testState = {};

/**
 * Describes suite of test scenarios for running standard tests against a REST endpoint.
 * @param {string} endpointDescription The description of the test suite. Will be used as the
 * `describe()` description for the suite, and will be appended with the string `' endpoint'`.
 * @param {TestScenario[]} testScenarios An array of {@link TestScenario} objects, defining
 * individual
 * sub-suites to run as part of this suite.
 */
const describeRestEndpoint = (endpointDescription, testScenarios) => {
  describe(`${endpointDescription} endpoint`, () => {
    testScenarios.forEach(
      ({
        description,
        setup,
        callEndpoint,
        statusCode,
        responseBody,
        schema,
        additionalAssertions = [],
        tearDown,
        saveToState,
      }) => {
        describe(description, () => {
          let response;

          before(async () => {
            if (setup) {
              await setup(testState);
            }
            response = await callEndpoint(testState);
          });

          if (statusCode) {
            it(`responds with a ${statusCode} status code`, () =>
              expect(response).to.have.status(statusCode));
          }

          if (responseBody) {
            it('response with the expected response body', async () => {
              let responseBodyToAssert;

              if (typeof responseBody === 'function') {
                responseBodyToAssert = responseBody(testState);
              } else {
                responseBodyToAssert = responseBody;
              }

              expect(response).to.comprise.of.json(responseBodyToAssert);
            });
          }

          if (schema) {
            it('responds with a body matching the defined schema', () =>
              expect(response).to.have.schema(schema));
          }

          additionalAssertions.forEach(({ assertionDescription, assertionFunction }) => {
            it(assertionDescription, () => assertionFunction(response, testState));
          });

          after(async () => {
            if (tearDown) {
              tearDown(testState, response);
            }

            if (saveToState) {
              let valueToSave;
              if (typeof saveToState.value === 'function') {
                valueToSave = saveToState.value(response);
              } else {
                valueToSave = saveToState.value;
              }

              testState[saveToState.key] = valueToSave;
            }
          });
        });
      },
    );
  });
};

/**
 * Returns a {@link SaveToStateRequest} that will save the response body to the state with the
 * given `key`.
 * @param {string} key The name of the key to save on the {@link TestState}.
 * @return {SaveToStateRequest} The {@link SaveToStateRequest}.
 */
const saveBodyToState = key => ({
  key,
  value: response => response.body,
});

/**
 * Returns an {@link AdditionalAssertion} for checking the length of an array response body.
 * @param {number} length The expected length for the assertion
 * @return {AdditionalAssertion} The {@link AdditionalAssertion}
 */
const assertResponseLengthOf = length => ({
  assertionDescription: `response has length of ${length}`,
  assertionFunction: response => expect(response.body).to.have.lengthOf(length),
});

/**
 * Returns an {@link AdditionalAssertion} designed for checking that a resource was actually updated
 * after a PUT request. The assertion will make a GET request (using `getFunction`) and check that
 * the response returned from the GET request matches the `expectedResourceAfterUpdate` (using
 * `expect(response).to.comprise.of.json(expectedResourceAfterUpdate)`).
 * @param {(state: TestState) => Promise<object>} getFunction A function that will make the GET
 * request and resolve with the Chakram response to verify.
 * @param {object} expectedResourceAfterUpdate The expected object to be found after making the GET
 * request.
 * @return {AdditionalAssertion} The {@link AdditionalAssertion}
 */
const assertResourceUpdated = (getFunction, expectedResourceAfterUpdate) => ({
  assertionDescription: 'updates the resource as expected',
  assertionFunction: async (_, state) => {
    const response = await getFunction(state);
    expect(response).to.comprise.of.json(expectedResourceAfterUpdate);
  },
});

/**
 * Returns an {@link AdditionalAssertion} designed for checking that a resource was actually deleted
 * after a DELETE request. The assertion will make a GET request (using `getFunction`) and check
 * that the response returned from the GET request has a status code of 404 (using
 * `expect(response).to.have.status(404)`).
 * @param {(state: TestState) => Promise<object>} getFunction A function that will make the GET
 * request and resolve with the Chakram response to verify.
 * @return {AdditionalAssertion} The {@link AdditionalAssertion}
 */
const assertResourceDeleted = getFunction => ({
  assertionDescription: 'deleted the resource',
  assertionFunction: async (_, state) => {
    const response = await getFunction(state);
    expect(response).to.have.status(404);
  },
});

module.exports = {
  assertResourceDeleted,
  assertResourceUpdated,
  assertResponseLengthOf,
  describeRestEndpoint,
  saveBodyToState,
};
