const mongoose = require('mongoose');
Schema = mongoose.Schema;

const ExpensesLogSchema = new mongoose.Schema(
  {
    log: {
      type: String,
      default: 'Expenses Logs',
      required: true,
    },
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expenses',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      required: true,
    },
    requestParameters: {
      type: Array,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('expenseslog', ExpensesLogSchema);
