const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    ia: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        required: true
    },
    user: {
        type: ObjectId,
        required: false,
    },
});

module.exports = mongoose.model('Books', bookSchema);