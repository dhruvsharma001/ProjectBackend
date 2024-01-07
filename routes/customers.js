const customers = require('express').Router();
const customersController = require('../controllers/customers');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

customers.get(
  '/get',
  authAdmin({ admin: true, employee: true }),
  customersController.get
);

customers.get('/details/:uid', customersController.getDetails);
//user.post("/insertUser", authAdmin, userController.insertUser);
/* signup request */
customers.post(
  '/addCustomer',
  // authAdmin({ admin: true, employee: false }),
  customersController.addCustomer
);
customers.get('/count', authAdmin({admin: true, employee:true}), customersController.getCount
);


// customers.post(
//   '/add',
//   // authAdmin({ admin: true, employee: false }),
//   customersController.add
// );

// user.post("/add", authAdmin({ admin: true, employee: false }), userController.add);

customers.put(
  '/edit/:id',
  authAdmin({ admin: true, employee: true }),
  customersController.updateCustomer
);

customers.post(
  '/remove',
  // authAdmin({ admin: true, employee: true }),
  customersController.deleteCustomer
);

module.exports = customers;
