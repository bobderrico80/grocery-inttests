/**
 * A module for managing shared state between tests
 * @module state
 */

/**
 * @typedef {object} State An object containing the state of the test. This object allows
 * data to be shared between test suites.
 */

const state = {};

/**
 * Saves data to the state on the given key.
 * @param {string} key The key name for the data
 * @param {*} value The data to save to the state
 */
const put = (key, value) => {
  state[key] = value;
};

/**
 * Saves all of the key/value pairs on the object to the state.
 * @param {object} object An object containing the data to save to state
 */
const putAll = (object) => {
  Object.entries(object).forEach(([key, value]) => put(key, value));
};

/**
 * Gets a single value by key from the state.
 * @param {string} key The key name for the data to retrieve
 * @return {*} The value from the state
 */
const get = key => state[key];

/**
 * Gets the entire state object.
 * @return {State} The state object.
 */
const getAll = () => state;

/**
 * Clears all key/value pairs from the state
 */
const clear = () => {
  Object.keys(state).forEach((key) => {
    delete state[key];
  });
};

module.exports = {
  clear,
  get,
  getAll,
  put,
  putAll,
};
