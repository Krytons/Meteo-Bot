const debug = require('debug')('app:routes:v1');
const express = require('express');
const router = express.Router();

debug('Configuring routes');

// Import and setup base routes
const example = require('./example');

router.use('/example', example);


module.exports = router;