const debug = require('debug')('app:controllers:v1:meteo');

const MeteoService = require('../../services/v1/meteo');


const MeteoController = {

    obtainLocation: async (bot, ctx) => {
        debug('Executing obtainLocation');
        return MeteoService.obtainLocation(bot, ctx);
    },

    setMeteoLocation: async (bot, ctx) => {
        debug('Executing setMeteoLocation');
        return MeteoService.saveUserMeteoLocation(bot, ctx);
    },

    obtainMeteoByLocation: async (bot, ctx) => {
        debug('Executing obtainMeteoByLocation');
        return MeteoService.obtainMeteoByLocation(bot, ctx);
    },

    yesterdayMeteo: async (bot, ctx) => {
        debug('Executing yesterdayMeteo');
        return MeteoService.yesterdayMeteo(bot, ctx);
    }

    
};

module.exports = MeteoController;