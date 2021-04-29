const express = require('express');
const debug = require('debug')('app:routes:index');
const router = express.Router();
const v1 = require('./v1');
const HealthCheckController = require('../controllers/healthCheck');

debug('Configuring routes');

// Healthy check
router.get('/', HealthCheckController.index);

// API versions
router.use('/v1', v1);

module.exports = router;