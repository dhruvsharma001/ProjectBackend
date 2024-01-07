const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        default: 'Planned Leave'
    },
    className: {
        type: String,
        default: 'bg-orange'
    },
    status: {
        type: String,
        default: 'Pending'
    },
    total_days: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('leave', LeaveSchema);