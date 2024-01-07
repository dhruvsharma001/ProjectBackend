const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const Customers = require('../models/Customers');
// const UserBreak = require('../models/UserBreaks');
// const UserHistory = require('../models/UserHistories');
// const importCustomers = require('../config/init');

const customers = {};

customers.get = (req, res, next) => {
  Customers.find({})
    .sort({ _id: -1 })
    .select({
      name: 1,
      email: 1,
      status: 1,
      phone: 1,
      profile: 1,
    })
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};

customers.getDetails = (req, res, next) => {
  if (req.params.uid) {
    Customers.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(req.params.uid) },
      },
    ])
      .then((data) => res.json({ data: data }))
      .catch(next);
  } else {
    res.json({ error: 'Empty Set' });
  }
};

// customers.uploadCustomers = (req, res) => {
//   uploads(req, res, (error) => {
//     console.log('Request ---', req.body);
//     console.log('Request file ---', req.file);
//     //Here you get file.
//     /*Now do where ever you want to do*/
//     if (error) {
//       //instanceof multer.MulterError
//       // res.status(500);
//       if (error.code == 'LIMIT_FILE_SIZE') {
//         error.message = 'File Size is too large. Allowed file size is 200KB';
//         error.success = false;
//       }
//       return res.json(error);
//     } else {
//       if (!req.file) {
//         res.status(500);
//         res.json('file not found');
//       }
//       res.status(200);
//       // importCustomers();

//       // res.json({
//       //   success: true,
//       //   message: 'File uploaded successfully!',
//       // });
//     }
//   });
// };
customers.getCount = (req, res, next) => {
  Customers.find({}).count()
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};
customers.addCustomer = (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);
    // const ip = req.connection.remoteAddress.replace('::ffff:', '');

    let record = new Customers();
    record.name = req.body.name || '';
    record.email = req.body.email || null;
    record.status = req.body.status || '';
    record.phone = req.body.phone || '';
    record.profile = req.body.profile || null;

    record
      .save()
      .then((udata) => {
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.msg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

customers.updateCustomer = (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);

    const update = {
        name: req.body.name,
        email: req.body.email,
        status: req.body.status,
        phone: req.body.phone,
      },
      options = {
        upsert: false,
      };
    Customers.updateOne({ _id: req.params.id }, { $set: update }, options)
      .then((data) => {
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        res.status(503).json({ err: err });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

// customers.updateImageUrl = (req, res, next) => {
//   function removeFiles(image) {
//     return new Promise((resolve, reject) => {
//       const path = config.get('profile_directory');

//       try {
//         const f = path + image;
//         console.log(f);
//         fs.unlinkSync(f);
//         resolve(true);
//       } catch (err) {
//         console.error(err);
//         resolve(false);
//       }
//     });
//   }
//   if (req.body) {
//     const files = req.files;
//     let op = [];

//     if (!files) {
//       const error = new Error('Please choose files');
//       error.httpStatusCode = 400;
//       return res.send(error);
//     }
//     files.forEach((e) => {
//       op = [...op, e.filename];
//     });
//     Customers.findOne({ _id: req.params.uid })
//       .then(async (data) => {
//         if (!data) {
//           return res.status(422).json({ error: 'Data not Found.' });
//         }
//         const a = await removeFiles(data.imageUrl);
//         data.imageUrl = op[0];
//         data
//           .save()
//           .then((d) => res.json({ success: 'OK' }))
//           .catch(next);
//       })
//       .catch((err) => {
//         res.status(503).json({ err: err });
//       });
//   } else {
//     res.status(503).json({ err: 'Not data found.' });
//   }
// };

customers.deleteCustomer = (req, res, next) => {
  // console.log(req.body);
  const id = req.body.id;
  Customers.findOne({ _id: id })
    .then(async (data) => {
      // const a = await removeFiles(data.imageUrl);
      // await UserBreak.deleteMany({ user: id });
      // await UserHistory.deleteMany({ user: id });
      data.delete().then((d) => res.json({ success: 'OK' }));
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

// users.removeImage = (req, res, next) => {
//   //  console.log(req.body.id)
//   const { id, image, ...rest } = req.body;

//   function removeFiles(image) {
//     return new Promise((resolve, reject) => {
//       const path = config.get('profile_directory');

//       try {
//         const f = path + image;
//         console.log(f);
//         fs.unlinkSync(f);
//         resolve(true);
//       } catch (err) {
//         console.error(err);
//         reject(err);
//         // resolve(true)
//       }
//     });
//   }

//   Customers.findOne({ _id: id })
//     .then(async (data) => {
//       await removeFiles(image);
//       data.profile = '';
//       data
//         .save()
//         .then((data) => res.json({ success: 'OK' }))
//         .catch(next);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.json({ error: err });
//     });
// };

module.exports = customers;
