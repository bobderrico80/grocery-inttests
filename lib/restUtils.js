const chakram = require('chakram');

const post = url => data => chakram.post(url, data);
const get = url => (idParam = '') => chakram.get(`${url}/${idParam}`);
const put = url => (idParam, data) => chakram.put(`${url}/${idParam}`, data);
const del = url => idParam => chakram.delete(`${url}/${idParam}`);

module.exports = {
  get,
  del,
  post,
  put,
};
