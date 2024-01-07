const mongoose = require("mongoose");



const NotificationSchema = new mongoose.Schema({
    device_token: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        default:''
    },
    status:{ type:String, default:'not_registered'}
}, {
    timestamps: true
})

module.exports = mongoose.model('notification', NotificationSchema);