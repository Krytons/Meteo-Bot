const debug = require('debug')('app:routes:v1:example');
const express = require('express');

debug('Example route');

const router = express.Router();

const ExampleController = require('../../controllers/v1/example');

// Define route and it's controller
router.route('/').get(ExampleController.index);

module.exports = router;