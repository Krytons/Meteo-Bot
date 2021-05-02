const debug = require('debug')('app:controllers:v1:meteo');

const MeteoService = require('../../services/v1/meteo');
const MeteoParserMiddleware = require('../../midllewares/meteo_parser');

const MeteoController = {

    obtainLocation: async (bot, ctx) => {
        debug('Executing obtainLocation');
        return MeteoService.obtainLocation(bot, ctx);
    },

    obtainMeteoByLocation: async (bot, ctx) => {
        debug('Executing obtainMeteoByLocation');
        data, type = MeteoService.obtainMeteoByLocation(bot, ctx);
        if (type != 0) {
            //Correct meteo answer
            var weather, temp, humidity = MeteoParserMiddleware.parseFullMeteo(data);
            return bot.telegram.sendMessage(ctx.chat.id, `Meteo based on your location: \nCurrent weather: ${weather} \nCurrent temperature: ${temp} \nCurrent humidity: ${humidity}`, {
            });
        }
        else {
            //Error: reset bot chat
            return bot.telegram.sendMessage(ctx.chat.id, data, {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        }
    }
};

module.exports = MeteoController;