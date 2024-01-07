const user = require('express').Router();
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

const config = require('config');
const path = require('path');

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

user.get(
  '/get',
  authAdmin({ admin: true, employee: true }),
  userController.get
);

user.get('/details/:uid', userController.getDetails);
//user.post("/insertUser", authAdmin, userController.insertUser);
/* signup request */
user.post('/insertUser', userController.insertUser);

user.post('/add',authAdmin({admin:true, employee: false}), userController.add);

// user.post("/add", authAdmin({ admin: true, employee: false }), userController.add);

user.put(
  '/edit/:id',
  authAdmin({ admin: true, employee: true }),
  userController.updateUser
);

user.post(
  '/remove',
  authAdmin({ admin: true, employee: false }),
  userController.deleteUser
);

user.get('/getRole', auth, userController.getRole);

// user.post(
//   '/upload',
//   authAdmin({ admin: true, employee: true }),
//   upload.array('file', 12),
//   userController.uploadfile
// );

// user.post(
//   '/profile/:uid',
//   upload.array('file', 12),
//   userController.updateProfile
// );

// user.post(
//   '/removeSingle',
//   authAdmin({ admin: true, employee: true }),
//   userController.removeSingleImage
// );

// user.post(
//   '/removeImage',
//   authAdmin({ admin: true, employee: true }),
//   userController.removeImage
// );

module.exports = user;
