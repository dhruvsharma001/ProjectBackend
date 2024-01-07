const path = require('path');

const orders = require('express').Router();
const ordersController = require('../controllers/orders');
// const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.profile_directory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // console.log(ext,'llllllllllll')
    if (ext !== '.png' && ext !== '.JPG' &&  ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});

orders.post('/zoho', ordersController.zohoWebhook);

orders.post(
  '/get',
  authAdmin({ admin: true, employee: true }),
  ordersController.get
);
orders.get('/orderedProductsInfo',  ordersController.orderedProductsInfo);
orders.post('/webhook', ordersController.telegram);
orders.post('/liveAccess', ordersController.liveAccess);
orders.post('/deliveryImageUpdate',
upload.single("receiptImage"),
ordersController.deliveryImageUpdate );
// orders.get('/details/:uid', ordersController.getDetails);
//user.post("/insertUser", authAdmin, userController.insertUser);
/* signup request */
orders.post(
  '/addOrder',
  // authAdmin({ admin: true, employee: false }),
  ordersController.addOrder
);


orders.post('/addAdminOrder',
  // authAdmin({ admin: true, employee: false}),
  ordersController.addAdminOrder
);
orders.post('/addReOrder',
ordersController.addReOrder
);

orders.post(
  '/addOrderCc',
  // authAdmin({ admin: true, employee: false }),
  ordersController.addOrderCc
);
orders.post("/getDeliveryStatus",
authAdmin({ admin: true, employee: true }),
 ordersController.getDeliveryStatus);
orders.post(
  '/editStatus/:id',
  authAdmin({ admin: true, employee: true }),
  ordersController.editStatus
);
orders.get("/getYearlyChartInfo", authAdmin({admin: true, employee: true}), ordersController.getYearlyChartInfo);
orders.post("/getSoldItems", authAdmin({admin: true, employee: true}), ordersController.getSoldItems);
orders.post("/getThirdPartyOrders", authAdmin({admin: true, employee: true}), ordersController.getThirdPartyOrders);
orders.post("/getRevenueDetails", authAdmin({admin: true, employee: false}), ordersController.getRevenueDetails);
orders.post("/getOrdersCost", authAdmin({admin: true, employee: false}), ordersController.getOrdersCost);
orders.get(
  '/count',
  authAdmin({ admin: true, employee: true }),
  ordersController.getCount
);
orders.post("/getOrdersCount", authAdmin({admin: true, employee: true}), ordersController.getOrdersCount);
// orders.post(
//   '/add',
//   // authAdmin({ admin: true, employee: false }),
//   ordersController.add
// );

// user.post("/add", authAdmin({ admin: true, employee: false }), userController.add);

// orders.put(
//   '/edit/:id',
//   authAdmin({ admin: true, employee: true }),
//   ordersController.updateOrder
// );
orders.post('/sendMail/:id', authAdmin({admin: true, employee: true}), ordersController.sendMail);
orders.post(
  '/remove',
  authAdmin({ admin: true, employee: true }),
  ordersController.deleteOrder
);

module.exports = orders;
