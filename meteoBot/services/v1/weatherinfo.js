const debug = require('debug')('app:services:v1:weatherinfo');
const WeatherInfo = require('../../models/weatherinfo');


const WeatherinfoService = {

    getAllMeteoInfoByCity: (req, res) => {
        debug('Executing getAllMeteoInfoByCity method');
        const city_name = req.params.city;
        WeatherInfo.find({ city: city_name }, '-_id -__v',(err, cities) => {
            if (err) {
                return res.status(500).json({
                    message: "An error occurred"
                });
            }
            if (cities.length == 0) {
                return res.status(200).json({
                    message: `There are no info about ${city_name}`
                });
            } else {
                return res.status(200).json({
                    message: `There are ${cities.length} entries about ${city_name}`,
                    meteoinformations: cities
                });
            }
        });
    },

    getAllMeteoData: (req, res) => {
        debug('Executing getAllMeteoData method');
        WeatherInfo.find({}, '-_id -__v', (err, cities) => {
            if (err) {
                return res.status(500).json({
                    message: "An error occurred"
                });
            }
            if (cities.length == 0) {
                return res.status(200).json({
                    message: `There are no info`
                });
            } else {
                return res.status(200).json({
                    message: `There are ${cities.length} entries`,
                    meteoinformations: cities
                });
            }
        });
    }

};

module.exports = WeatherinfoService;