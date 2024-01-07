const mongoose = require("mongoose");

const UserHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    logged_in: {
        type: Date,
        required: true
    },
    logged_out: {
        type: Date
    },
    total_time: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'Active'
    },
    reason: {
        type: String,
        default: ''
    }
}, {
    timestamps: false
})

module.exports = mongoose.model('user_history', UserHistorySchema);
