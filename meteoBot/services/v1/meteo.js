const debug = require('debug')('app:services:v1:meteo');
const User = require('../../models/user');
const { WEATHER_KEY } = require('../../config/env');

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
            }
            return bot.telegram.sendMessage(ctx.chat.id, 'Can we access your location?', requestLocationKeyboard);
        });
    },

    obtainMeteoByLocation: (bot, ctx) => {
        debug('Executing obtainMeteoByLocation method');
        User.findOne({ chat_id: ctx.chat_id }, (err, user) => {
            if (err) return ("An error has occurred", 0);
            if (!user) return ("Error: unknown user", 0);
            //Update user's location info
            user.coord_x = ctx.message.location.longitude;
            user.coord_y = ctx.message.location.latitude;
            user.save(function (err) {
                if (err) {
                    return ("An error has occurred", 0);
                }
            });
            http.get('http://api.openweathermap.org/data/2.5/weather?lat=' + user.coord_y + '&lon=' + user.coord_x + '&appid=' + WEATHER_KEY + '&units=metric', function (response) {
                response.setEncoding('utf8');
                response.on('data', function (data, err) {
                    if (err) {
                        return ("Meteo service error", 0);
                    }
                    return (data, 1);
                });
            });
        });
    }

};

const requestLocationKeyboard = {
    "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [
            [{
                text: "Give access to my location",
                request_location: true,
                one_time_keyboard: true
            }],
            ["Deny access"]
        ]
    }
}

module.exports = MeteoService