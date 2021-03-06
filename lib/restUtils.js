/**
 * A module containing curried functions for creating functions to perform GET, POST, PUT, and
 * DELETE requests against a provided URL.
 * @module restUtils
 */
const chakram = require('chakram');

/**
 * Creates a function that will make POST requests on the given URL. The returned function takes the
 * data object to POST.
 * @param {string} url The URL to make the request to
 * @param {object} options (Defaults to {}) HTTP Request options to pass with the request.
 * @return {(data: object) => Promise<object>} A function taking a data object and returning a
 * Promise resolving with the Chakram response from the POST request.
 */
const post = url => (data, options = {}) => chakram.post(url, data, options);

/**
 * Creates a function that will make a GET requests on the given URL. The returned function
 * optionally takes an `idParam`, which will be appended to the `url` with a forward slash.
 * @param {string} url The URL to make the request to
 * @param {object} options (Defaults to {}) HTTP Request options to pass with the request.
 * @return {(idParam?: string) => Promise<object>} A function taking an optional ID parameter, which
 * if provided will be appended to the `url` with a forward slash. It will return a Promise
 * resolving with the Chakram response from the GET request.
 */
const get = url => (idParam = '', options = {}) => chakram.get(`${url}/${idParam}`, options);

/**
 * Creates a function that will make a PUT requests on the given URL. The returned function takes an
 * `idParam`, which will be appended to the `url` with a forward slash, and a data object to PUT.
 * @param {string} url The URL to make the request to
 * @param {object} options (Defaults to {}) HTTP Request options to pass with the request.
 * @return {(idParam: string, data: object) => Promise<object>} A function taking an ID parameter,
 * which if provided will be appended to the `url` with a forward slash, and a data object to PUT.
 * It will return a Promise resolving with the Chakram response from the PUT request.
 */
const put = url => (idParam, data, options = {}) => chakram.put(`${url}/${idParam}`, data, options);

/**
 * Creates a function that will make a DELETE requests on the given URL. The returned function takes
 * an `idParam`, which will be appended to the `url` with a forward slash.
 * @param {string} url The URL to make the request to
 * @param {object} options (Defaults to {}) HTTP Request options to pass with the request.
 * @return {(idParam: string) => Promise<object>} A function taking an ID parameter,
 * which if provided will be appended to the `url` with a forward slash, and a data object to PUT.
 * It will return a Promise resolving with the Chakram response from the PUT request.
 */
const del = url => (idParam, options = {}) => chakram.delete(`${url}/${idParam}`, {}, options);

module.exports = {
  get,
  del,
  post,
  put,
};
