const debug = require('debug')('app:controllers:v1:weatherinfo');

const WeatherinfoService = require('../../services/v1/weatherinfo');

const WeatherinfoController = {

    getAllMeteoInfoByCity: async (req, res, next) => {
        debug('Executing getAllMeteoInfoByCity');
        return WeatherinfoService.getAllMeteoInfoByCity(req, res);
    },

    getAllMeteoData: async (req, res, next) => {
        debug('Executing getAllMeteoData');
        return WeatherinfoService.getAllMeteoData(req, res);
    }

};

module.exports = WeatherinfoController;