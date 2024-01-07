const products = require('express').Router();
const productsController = require('../controllers/products');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

// const config = require('config');
// const path = require('path');

// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, config.get('profile_directory'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     // console.log(ext,'llllllllllll')
//     if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
//       return cb(new Error('Only images are allowed'));
//     }
//     cb(null, true);
//   },
// });

products.get(
  '/get',
  authAdmin({ admin: true, employee: true }),
  productsController.get
);

products.get('/details/:uid', productsController.getDetails);
//user.post("/insertUser", authAdmin, userController.insertUser);
/* signup request */

// products.get('/download', productsController.download);
products.get('/count', authAdmin({admin: true, employee:true}),
productsController.getCount);

products.post(
  '/insertProduct',
  // authAdmin({ admin: true, employee: false }),
  productsController.insertProduct
);

products.post(
  '/add',
  // authAdmin({ admin: true, employee: false }),
  productsController.add
);

// user.post("/add", authAdmin({ admin: true, employee: false }), userController.add);

products.put(
  '/edit/:id',
  authAdmin({ admin: true, employee: true }),
  productsController.updateProduct
);

products.put(
  '/inventoryEdit/:id', authAdmin({admin: true, employee: true}),
  productsController.updateProductInventory
);

products.post(
  '/remove',
  // authAdmin({ admin: true, employee: true }),
  productsController.deleteProduct
);

products.post(
  '/uploadProducts',
  authAdmin({ admin: true, employee: true }),
  // upload.array('file', 12),
  productsController.uploadProducts
);

module.exports = products;
