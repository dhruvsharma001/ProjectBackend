const mongoose = require('mongoose');
Schema = mongoose.Schema;

const LogSchema = new mongoose.Schema(
  {
    log: {
      type: String,
      default: 'Product Logs',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    requestType: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
    requestParameters: {
      type: Array,
    },
    issue: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('log', LogSchema);
