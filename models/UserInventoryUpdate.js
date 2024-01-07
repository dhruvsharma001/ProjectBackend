const mongoose = require("mongoose");

const UserInventoryUpdateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    check: {
        type: Boolean,
        default: true
    },
    issue: {
        type: String
    },
    updateTime: {
        type: Date
    },
    remarks: {
        type: String,
    },
    quantity: {
        type: Number
    },
    status: {
        type: String,
        default: 'Active'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('user_inventory_update', UserInventoryUpdateSchema);
