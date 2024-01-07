const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
    },
    SKU: {
      type: String,
      unique: true
    },
    HSN: {
      type: String,
    },
    BuyingPrice: {
      type: Number,
    },
    SellingPrice: {
      type: Number,
    },
    location: {
      type: String,
      default: '',
    },
    productNumber: {
      type: String,
      default: '',
    },
    Category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'default.jpeg',
    },
    productType: {
      type: String,
      default: "WH"
    },
    ReOrder: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('product', ProductSchema);
