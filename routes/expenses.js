const expenses = require('express').Router();
const expensesController = require('../controllers/expenses');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');


expenses.get(
  '/get',
  authAdmin({ admin: true, employee: true }),
  expensesController.get
);

expenses.get('/details/:uid', expensesController.getDetails);

expenses.get('/count', authAdmin({admin: true, employee:true}),
expensesController.getCount);

expenses.post(
  '/insertExpense',
  // authAdmin({ admin: true, employee: false }),
  expensesController.insertExpense
);

expenses.put(
  '/edit/:id',
  authAdmin({ admin: true, employee: true }),
  expensesController.updateExpense
);

expenses.post(
  '/remove',
  // authAdmin({ admin: true, employee: true }),
  expensesController.deleteExpense
);
expenses.post('/getExpenses',
  // authAdmin({ admin: true, employee: true }),
expensesController.getExpensesDetails);


module.exports = expenses;
