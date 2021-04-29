var express = require('express');
const debug = require('debug')('app');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes');

debug('Start');

//Database connection, using mongoose
const { HOST, DB_NAME } = require('./config/env');

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

module.exports = app;