const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    date: { 
      type: Date,
      default: Date.now 
    },
    expenseType: {
      type: String,
    },
    amount: {
      type: Number,
    },
    remarks: {
      type: String,
      default: "None"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('expense', ExpenseSchema);
