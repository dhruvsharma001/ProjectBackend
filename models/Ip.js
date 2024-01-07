const mongoose = require("mongoose");

const IpSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('ip_address', IpSchema);