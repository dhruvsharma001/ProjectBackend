const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    magentoOrderId: {
      type: String,
    },
    orderedProducts: {
      type: Number,
    },
    receiptImage: {
      type: String
    },
    discountAmount: {
      type: Number,
    },
    couponCode: {
      type: String,
    },
    guest: {
      type: String,
    },
    shippingDiscountAmount: {
      type: Number,
    },
    shippingAmount: {
      type: Number,
    },
    orderTotalInclTax: {
      type: Number,
    },
    mailReport: [{ name: String ,value: Boolean, awsResponseData: Array,  date: Date }],
    orderGrandTotal: {
      type: Number,
      default: 0,
    },
    orderCurrencyCode: {
      type: String,
      default: 'INR',
    },
    magentoCustomerId: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    orderDetails: {
      type: Array,
      default: [],
      required: true,
    },
    remote_ip: {
      type: String,
    },
    magentoShippingAddressId: {
      type: String,
    },
    storeName: {
      type: String,
      default: 'Whispering Homes',
    },
    address: {
      type: Array,
    },
    comments: {
      type: String,
      default: 'No Comments!',
    },
    waybill: {
      type: String,
      default: 'N/A',
    },
    waybillArray: [{ waybill: String , status: String }]
    ,
    shippingCost: {
      type: Number,
      default: 0,
    },
    payment_status: {
      type: String,
      default: 'Pending',
    },
    payment_method: {
      type: String,
      default: "N/A"
    },
    orderDate: {
      type: Date
    },
    orderSource: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('order', OrderSchema);
