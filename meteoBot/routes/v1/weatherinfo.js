const debug = require('debug')('app:routes:v1:weatherinfo');
const express = require('express');

debug('Weatherinfo route');

const router = express.Router();

const WeatherinfoController = require('../../controllers/v1/weatherinfo');

// Define route and it's controller
router.route('/getAllMeteoByCity/:city').get(
    WeatherinfoController.getAllMeteoInfoByCity);

router.route('/getAllMeteoData').get(
    WeatherinfoController.getAllMeteoData);

module.exports = router;