const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: 'Active',
    },
    phone: {
      type: String,
    },
    ip: {
      type: String,
    },
    profile: {
      type: String,
      default: 'default.jpeg',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('customer', CustomerSchema);
