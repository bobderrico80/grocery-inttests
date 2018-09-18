const { expect } = require('chakram');

const testState = {};

const describeRestEndpoint = (endpointDescription, testCases) => {
  describe(`${endpointDescription} endpoint`, () => {
    testCases.forEach(
      ({
        description,
        callEndpoint,
        statusCode,
        responseBody,
        schema,
        additionalAssertions = [],
        setup,
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

const saveBodyToState = key => ({
  key,
  value: response => response.body,
});

const assertResponseLengthOf = length => ({
  assertionDescription: `response has length of ${length}`,
  assertionFunction: response => expect(response.body).to.have.lengthOf(length),
});

const assertResourceUpdated = (getFunction, expectedResourceAfterUpdate) => ({
  assertionDescription: 'updates the resource as expected',
  assertionFunction: async (_, state) => {
    const response = await getFunction(state);
    expect(response).to.comprise.of.json(expectedResourceAfterUpdate);
  },
});

const assertResourceDeleted = deleteFunction => ({
  assertionDescription: 'deleted the resource',
  assertionFunction: async (_, state) => {
    const response = await deleteFunction(state);
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
