const mongoose = require('mongoose');
const debug = require('debug')('app:models:user');

debug('Initializing user schema');
const userSchema = new mongoose.Schema({
    chat_id: { type: String, require: true, unique: true },
    coord_y: { type: Number, require: true },
    coord_x: { type: Number, require: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;