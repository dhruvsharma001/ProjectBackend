const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    type: { type: String, default: 'Notification' },
    start: { type: Date },
    end: { type: Date },
    className: { type: String, default: 'bg-blue' },
}, {
    timestamps: true
})

module.exports = mongoose.model('news', NewsSchema);