const debug = require('debug')('app:services:v1:meteo');

const MeteoService = {

    obtainLocation: (bot, ctx) => {
        debug('Executing get location method');
        return bot.telegram.sendMessage(ctx.chat.id, 'Can we access your location?', requestLocationKeyboard);
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