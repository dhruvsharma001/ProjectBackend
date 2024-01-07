const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'employee'
    },
    status: {
        type: String,
        default: 'Active'
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    ip: {
        type: String
    },
    profile: {
        type: String,
        default: 'default.jpeg'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('user', UserSchema);