var express = require('express');
const debug = require('debug')('app');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes');

debug('Start');

//Database connection, using mongoose
const { HOST, DB_NAME, TELEGRAM_KEY } = require('./config/env');

const host = HOST;
const dbName = DB_NAME;
debug('Connecting to MongoDB Database');
mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://${host}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', () => {
    debug('Connection error!');
});
db.once('open', () => {
    debug('DB connection Ready');
});

//Init express application
const app = express();

// Enable CORS
app.use(cors());

// Setup logger and body parser
app.use(morgan('dev'));
app.use(bodyParser.json());

// Setup routes
app.use(routes);

// Solve 304 problem
app.disable('etag');

// Handle 404 errors
app.use(function (req, res, next) {
    res.status(404);
    // respond with json
    if (req.accepts('json')) {
        res.json({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// Setup telegram bot
const Telegraf = require('telegraf');

//Handle telegram bot configuration using telegraf
const bot = new Telegraf.Telegraf(TELEGRAM_KEY);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

//Commands list
bot.start((ctx) => ctx.reply('Welcome to meteo bot: this bot is currently under development, so please do not use it yet'))

//Dummy command
bot.command('hello', ctx => {
    debug('Welcome command');
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'Welcome to meteo bot, type /meteo to start ', {})
});
//Meteo command
const MeteoController = require('./controllers/v1/meteo');
bot.command('meteo', ctx => {
    debug('Meteo command triggered by: ' + ctx.message.chat.id);
    //Control if location is needed
    MeteoController.obtainLocation(bot,ctx);
});
//Location
bot.on('location', (ctx) => {
    debug('Received location message from: ' + ctx.message.chat.id);
    bot.telegram.sendMessage(ctx.chat.id, '✔️ You granted your location info, please wait for meteo informations', {})
    MeteoController.setMeteoLocation(bot, ctx);
    //MeteoController.obtainMeteoByLocation(bot, ctx);
})
//Deny access to location
bot.hears('Deny access', ctx => {
    debug('Deny command triggered by: ' + ctx.message.chat.id);
    // Explicit usage
    bot.telegram.sendMessage(ctx.chat.id, '❌ You denied location access', {
        reply_markup: {
            remove_keyboard: true
        }
    })
});
//Actual meteo
bot.action('current', ctx => {
    debug('Actual meteo command triggered by: ' + ctx.from.id);
    MeteoController.obtainMeteoByLocation(bot, ctx);
});
//Previous meteo
bot.action('previous', ctx => {
    debug('Previous meteo command triggered by: ' + ctx.from.id);
    bot.telegram.sendMessage(ctx.chat.id, '❌ Not implemented yet', {
        reply_markup: {
            remove_keyboard: true
        }
    })
});


bot.launch();

module.exports = app;