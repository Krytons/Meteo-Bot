//Module dependencies
const app = require('../app');
const http = require('http');
const env = require('../config/env');
const debug = require('debug')('app');

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) return val;
    if (port >= 0) return port;

    return false;
}

//Port setup
const port = normalizePort(env.PORT);
app.set('port', port);

//Create http server
const server = http.createServer(app);

//Listen on the decided port
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
module.exports.server = server;

//Event listener for HTTP server
//Error event
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
//Listening event
function onListening() {
    var addr = server.address();
    var bind = 'port ' + addr.port;
    debug('Listening on ' + bind);
}