const mongoose = require('mongoose');
Schema = mongoose.Schema;

const OrderLogsSchema = new mongoose.Schema(
  {
    log: {
      type: String,
      default: 'Order Logs',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Orders',
      required: true,
    },
    magentoOrderId: {
      type: String,
    },
    requestType: {
      type: String,
      required: true,
    },
    requestParameters: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('order_logs', OrderLogsSchema);
