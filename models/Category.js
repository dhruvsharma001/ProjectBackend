const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'default.jpeg',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('category', CategorySchema);
