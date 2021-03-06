const debug = require('debug')('app:services:v1:meteo');
const User = require('../../models/user');
const Weatherinfo = require('../../models/weatherinfo');
const MeteoParserMiddleware = require('../../midllewares/meteo_parser');
const http = require('http');
const { METEO_KEY } = require('../../config/env');
const { json } = require('body-parser');

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
                actualUser.last_city = "Default";
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
                                { text: "Previous meteo", callback_data: 'previous' },
                                { text: "Forecast meteo", callback_data: 'forecast' }
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
                //Obtain current city by calling open weather API
                obtainMeteo(user, ctx, bot, 0);
                return bot.telegram.sendMessage(ctx.chat.id, 'What kind of meteo information are you looking for?', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Current meteo", callback_data: 'current' },
                                { text: "Previous meteo", callback_data: 'previous' },
                                { text: "Forecast meteo", callback_data: 'forecast' }
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
            //Call meteo api
            return obtainMeteo(user, ctx, bot);
        });
    },

    previousMeteo: (bot, ctx, days) => {
        debug('Executing previousMeteo method');
        let tot_temp = 0, tot_humidity = 0, tot_elements = 0;
        let weather_counter = {
            "Clear": 0,
            "Clouds": 0,
            "Rain": 0,
            "Thunderstorm ": 0,
            "Snow": 0,
            "Mist": 0
        };
        let mean_weather = {
            "name": "Default",
            "value": 0
        };
        User.findOne({ chat_id: ctx.chat.id }, (err, user) => {
            if (err) {
                //TODO: add log
                debug("Find user error");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            if (!user) {
                //TODO: add log
                debug("User not found");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            //At this point the user exists
            debug(user.last_city);
            var today = new Date(Date.now());
            //Set to midnight
            today.setHours(0, 0, 0, 0);
            Weatherinfo.find({
                created_at: {
                    $gte: new Date(today - (24 * days) * 60 * 60 * 1000),
                    $lt: new Date(today)
                },
                city: user.last_city
            }, (err, informations) => {
                if (err) {
                    debug(`ERROR: ${err}`);
                    return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                };
                if (informations.length == 0) {
                    //TODO: add log
                    debug("Informations not found");
                    return bot.telegram.sendMessage(ctx.chat.id, 'No informations for yesterday', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                };
                informations.forEach((info) => {
                    tot_temp += info.temp;
                    tot_humidity += info.humidity;
                    weather_counter[info.weather]++;
                    if (weather_counter[info.weather] > mean_weather['value']) {
                        mean_weather['name'] = info.weather;
                        mean_weather['value'] = weather_counter[info.weather];
                    };
                    tot_elements++;
                });
                //Average values calculus
                let mean_temp = tot_temp / tot_elements;
                let mean_humidity = tot_humidity / tot_elements;
                let name = "";
                if (days == 1) {
                    name = "Yesyerday";
                } else name = "Last week";
                return bot.telegram.sendMessage(ctx.chat.id, `${name} meteo in ${user.last_city}: \n🌍 Average weather: ${mean_weather.name} \n🌡️ Average temperature: ${mean_temp.toFixed()} \n💧 Average humidity: ${mean_humidity.toFixed()}`, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            });
        });
    },

    forecastMeteo: (bot, ctx) => {
        debug('Executing forecastMeteo method');
        //Step 1: get user's coordinates
        User.findOne({ chat_id: ctx.chat.id }, (err, user) => {
            if (err) {
                //TODO: add log
                debug("Find user error");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            if (!user) {
                //TODO: add log
                debug("User not found");
                return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            };
            //Step 2: call forecast meteo API
            var data = [];
            http.get('http://api.openweathermap.org/data/2.5/onecall?lat=' + user.coord_y + '&lon=' + user.coord_x + '&exclude=minutely,hourly,current&appid=' + METEO_KEY + '&units=metric', function (response) {
                response.on('data', function (chunk) {
                    data.push(chunk);
                }).on('end', function (err) {
                    if (err) {
                        return bot.telegram.sendMessage(ctx.chat.id, 'Meteo API currently unavailable', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    };
                    const json_data = JSON.parse(Buffer.concat(data).toString());
                    if (json_data.cod == 401) {
                        return bot.telegram.sendMessage(ctx.chat.id, 'API error', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    };
                    //Step 3 parse data and return them
                    bot.telegram.sendMessage(ctx.chat.id, `Forecast meteo in ${user.last_city} for this week: `, {});
                    const today = new Date(Date.now());
                    let d1 = `📅 Day ${today.getDate() + 1}: \n🌍 Average weather: ${json_data.daily[1].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[1].temp.day} \n💧 Average humidity: ${json_data.daily[1].humidity}`;
                    let d2 = `\n\n📅 Day ${today.getDate() + 2}: \n🌍 Average weather: ${json_data.daily[2].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[2].temp.day} \n💧 Average humidity: ${json_data.daily[2].humidity}`;
                    let d3 = `\n\n📅 Day ${today.getDate() + 3}: \n🌍 Average weather: ${json_data.daily[3].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[3].temp.day} \n💧 Average humidity: ${json_data.daily[3].humidity}`;
                    let d4 = `\n\n📅 Day ${today.getDate() + 4}: \n🌍 Average weather: ${json_data.daily[4].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[4].temp.day} \n💧 Average humidity: ${json_data.daily[4].humidity}`;
                    let d5 = `\n\n📅 Day ${today.getDate() + 5}: \n🌍 Average weather: ${json_data.daily[5].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[5].temp.day} \n💧 Average humidity: ${json_data.daily[5].humidity}`;
                    let d6 = `\n\n📅 Day ${today.getDate() + 6}: \n🌍 Average weather: ${json_data.daily[6].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[6].temp.day} \n💧 Average humidity: ${json_data.daily[6].humidity}`;
                    let d7 = `\n\n📅 Day ${today.getDate() + 7}: \n🌍 Average weather: ${json_data.daily[7].weather[0].main} \n🌡️ Average temperature: ${json_data.daily[7].temp.day} \n💧 Average humidity: ${json_data.daily[7].humidity}`;
                    return bot.telegram.sendMessage(ctx.chat.id, d1+d2+d3+d4+d5+d6+d7, {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });

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
                resize_keyboard: true,
                one_time_keyboard: true
            }],
            ["Deny access"]
        ]
    }
}

function obtainMeteo(user, ctx, bot, message = 1) {
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
            //Step 1: save meteo informations
            saveMeteoInformations(weather, temp, humidity, city);
            //Step 2: return a response to the user and update user last city
            user.last_city = city;
            user.save(function (err) {
                if (err) {
                    debug("Save error");
                    return bot.telegram.sendMessage(ctx.chat.id, 'An internal error has occured', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                if (message) {
                    if (img_url != undefined) {
                        bot.telegram.sendPhoto(ctx.chat.id, { source: img_url });
                    }
                    return bot.telegram.sendMessage(ctx.chat.id, `Meteo based on your location: \n🌍 Current weather: ${weather} \n🌡️ Current temperature: ${temp} \n💧 Current humidity: ${humidity}`, {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                } else return;
            });
        });
    });
}

function saveMeteoInformations(weather, temp, humidity, city) {
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