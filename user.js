const mongoose = require ('mongoose');
const cors = require('cors');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        Required:[true, 'username cannot be blank']
    },
    password: {
        type: String,
        Required:[true, 'username cannot be blank']
    }
})

module.exports = mongoose.model('User', userSchema);