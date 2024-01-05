const basicAuth = require('express-basic-auth');

const authenticationMiddleware = basicAuth({
    users: { 'supperAdmin': 'Zxcqwe@098' }, // replace with your own username and password
    challenge: true, // show login dialog to clients (optional)
    unauthorizedResponse: 'Unauthorized' // response to send if authentication fails (optional)
});

module.exports = authenticationMiddleware;