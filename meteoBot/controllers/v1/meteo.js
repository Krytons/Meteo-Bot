const debug = require('debug')('app:controllers:v1:meteo');

const MeteoService = require('../../services/v1/meteo');

const MeteoController = {

    obtainLocation: async (bot, ctx) => {
        debug('Executing obtain location');
        //Step 1: 
        return MeteoService.obtainLocation(bot, ctx);
    }
};

module.exports = MeteoController;