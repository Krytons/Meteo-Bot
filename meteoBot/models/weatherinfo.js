const mongoose = require('mongoose');
const debug = require('debug')('app:models:weatherinfo');

debug('Initializing weatherinfo schema');
const weatherinfoSchema = new mongoose.Schema({
    city: { type: String, require: true },
    coord_y: { type: Number, require: true },
    coord_x: { type: Number, require: true },
    temp: { type: Number, require: true },
    humidity: { type: Number, require: true },
    weather: { type: String, require: true }
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

weatherinfoSchema.index({
    coord_y: 1,
    coord_x: 1,
    created_at: 1
}, {
    unique: true
});

const Weatherinfo = mongoose.model('Weatherinfo', weatherinfoSchema);
module.exports = Weatherinfo;