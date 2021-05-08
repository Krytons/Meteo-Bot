const debug = require('debug')('app:services:v1:weatherinfo');
const WeatherInfo = require('../../models/weatherinfo');


const WeatherinfoService = {

    getAllMeteoInfoByCity: (req, res) => {
        debug('Executing getAllMeteoInfoByCity method');
        return res.status(200).json({ status: "Method ok!" });
    },

    getAllMeteoData: (req, res) => {
        debug('Executing getAllMeteoData method');
        return res.status(200).json({ status: "Method ok!" });
    }

};

module.exports = WeatherinfoService;