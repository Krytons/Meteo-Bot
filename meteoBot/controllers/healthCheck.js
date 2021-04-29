const debug = require('debug')('app:controllers:healthCheck');

const HealthyCheckController = {

    index: (req, res) => {
        debug('Health check action');
        res.status(200).send('Meteo bot is running');
    },

};

module.exports = HealthyCheckController;