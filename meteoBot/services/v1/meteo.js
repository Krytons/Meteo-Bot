const debug = require('debug')('app:services:v1:meteo');
const User = require('../../models/user');
const Weatherinfo = require('../../models/weatherinfo');
const MeteoParserMiddleware = require('../../midllewares/meteo_parser');
const http = require('http');
const { METEO_KEY } = require('../../config/env');

const MeteoService = {

    obtainLocation: (bot, ctx) => {
        debug('Executing obtainLocation method');
        //An user asked for this service, if he does not exist add him
        User.findOne({ chat_id: ctx.chat.id }, (err, user) => {
            if (err) return bot.telegram.sendMessage(ctx.chat.id, 'Something is wrong with your chat id', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            if (!user) {
                //The user does not exist in the current DB
                let actualUser = new User({ chat_id: ctx.chat.id });
                actualUser.coord_x = 0.0;
                actualUser.coord_y = 0.0;
                actualUser.save((err) => {
                    if (err) {
                        debug(`ERROR: ${err}`);
                        return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    }
                });
                return bot.telegram.sendMessage(ctx.chat.id, 'In order to obtain meteo informations i need to know your location', requestLocationKeyboard);
            }
            //The user already exists: check if it's location is recent.
            const time = new Date(Date.now() - 60 * 60 * 1000);
            const last_update = user.updated_at;
            debug(time);
            debug(last_update);
            if (time > last_update) {
                return bot.telegram.sendMessage(ctx.chat.id, 'In order to obtain meteo informations i need to know your location', requestLocationKeyboard);
            } else {
                return bot.telegram.sendMessage(ctx.chat.id, 'What kind of meteo information are you looking for?', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Current meteo", callback_data: 'current' },
                                { text: "Previous meteo", callback_data: 'previous' }
                            ],

                        ]
                    }
                });
            }
        });
    },

    saveUserMeteoLocation: (bot, ctx) => {
        debug('Executing saveUserMeteoLocation method');
        User.findOne({ chat_id: ctx.chat.id }, (err, user) => {
            if (err) {
                //TODO: add log
                debug("Find user error");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }
            if (!user) {
                //TODO: add log
                debug("User not found");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            //Update user's location info
            debug(ctx.message.location.longitude);
            user.coord_x = ctx.message.location.longitude;
            user.coord_y = ctx.message.location.latitude;
            user.save(function (err) {
                if (err) {
                    debug("Save error");
                    return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                return bot.telegram.sendMessage(ctx.chat.id, 'What kind of meteo information are you looking for?', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Current meteo", callback_data: 'current' },
                                { text: "Previous meteo", callback_data: 'previous' }
                            ],

                        ]
                    }
                });
            });
        });
    },

    obtainMeteoByLocation: (bot, ctx) => {
        debug('Executing obtainMeteoByLocation method');
        User.findOne({ chat_id: ctx.chat.id }, (err, user) => {
            if (err) {
                //TODO: add log
                debug("Find user error");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }
            if (!user) {
                //TODO: add log
                debug("User not found");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            //Step 1: call meteo api
            http.get('http://api.openweathermap.org/data/2.5/weather?lat=' + user.coord_y + '&lon=' + user.coord_x + '&appid=' + METEO_KEY + '&units=metric', function (response) {
                response.setEncoding('utf8');
                response.on('data', function (data, err) {
                    if (err) {
                        return bot.telegram.sendMessage(ctx.chat.id, 'Meteo API currently unavailable', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    };
                    if (JSON.parse(data).cod == 401) {
                        return bot.telegram.sendMessage(ctx.chat.id, 'API error', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    };
                    var { weather, temp, humidity, img_url, city } = MeteoParserMiddleware.parseFullMeteo(data);
                    //Step 2: save meteo informations
                    saveMeteoInformations(weather, temp, humidity, city);
                    //Step 3: return a response to the user
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
        });
    },

};

const requestLocationKeyboard = {
    "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [
            [{
                text: "Give access to my location",
                request_location: true,
                resize_keyboard: true,
                one_time_keyboard: true
            }],
            ["Deny access"]
        ]
    }
}

function saveMeteoInformations(weather, temp, humidity, city){
    debug('Executing saveMeteoInformations method');
    let actualWeather = new Weatherinfo();
    actualWeather.city = city;
    actualWeather.temp = temp;
    actualWeather.humidity = humidity;
    actualWeather.weather = weather;
    actualWeather.save((err) => {
        if (err) {
            debug(`ERROR: ${err}`);
            return;
        }
    });
}

module.exports = MeteoService;