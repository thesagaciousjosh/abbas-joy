const { handleRequest } = require('../local-server');

module.exports = async function handler(request, response) {
  await handleRequest(request, response);
};
