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
    }

    /*
    obtainMeteoByLocation: async (bot, ctx) => {
        debug('Executing obtainMeteoByLocation');
        //Step 1: call meteo api
        http.get('http://api.openweathermap.org/data/2.5/weather?lat=' + ctx.message.location.latitude + '&lon=' + ctx.message.location.longitude + '&appid=' + METEO_KEY + '&units=metric', function (response) {
            response.setEncoding('utf8');
            response.on('data', function (data, err) {
                if (err) {
                    return bot.telegram.sendMessage(ctx.chat.id, 'Meteo API currently unavailable', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                if (JSON.parse(data).cod == 401) {
                    return bot.telegram.sendMessage(ctx.chat.id, 'API error', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                var { weather, temp, humidity, img_url, city } = MeteoParserMiddleware.parseFullMeteo(data);
                //Step 2: save user location
                MeteoService.saveUserMeteoLocation(bot, ctx);
                //Step 3: save meteo informations
                MeteoService.saveMeteoInformations(weather, temp, humidity, city);
                //Step 4: return a response to the user
                if (img_url != undefined) {
                    bot.telegram.sendPhoto(ctx.chat.id, { source: img_url });
                }
                return bot.telegram.sendMessage(ctx.chat.id, `Meteo based on your location: \n🌍 Current weather: ${weather} \n🌡️ Current temperature: ${temp} \n💧 Current humidity: ${humidity}`, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            });
        }); 
    }
    */
};

module.exports = MeteoController;