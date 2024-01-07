const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Users = require('../models/Users');
const UserHistory = require('../models/UserHistories');

const salt = bcrypt.genSaltSync(10);

const jwt = require('jsonwebtoken');
const config = require('config');
const fs = require('fs');

const users = {};

users.get = (req, res, next) => {
  Users.find({ role: { $ne: 'admin' } })
    .sort({ _id: -1 })
    .select({
      name: 1,
      email: 1,
      role: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
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

users.getDetails = (req, res, next) => {
  if (req.params.uid) {
    Users.aggregate([
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

users.insertUser = (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const ip = req.connection.remoteAddress.replace('::ffff:', '');

    let record = new Users();
    record.name = req.body.name || '';
    record.email = req.body.email;
    record.phone = req.body.phone || '';
    record.password = hash;
    record.ip = ip;

    record
      .save()
      .then((udata) => {
        const payload = {
          user: {
            uid: udata._id,
            role: udata.role,
            name: udata.name,
            profile: udata.profile,
          },
        };
        // jwt.sign(
        //   payload,
        //   config.get('jwtSecret'),
        //   { expiresIn: 12 * 60 * 60 },
        //   (err, token) => {
        //     if (err) throw err;
        //     return res.json({ token });
        //   }
        // );

        //res.json({ data: data });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.errmsg });
      });
  } else {
    res.status(503).json({ err: 'Error adding User.' });
  }
};

users.add = (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const ip = req.connection.remoteAddress.replace('::ffff:', '');

    let record = new Users();
    record.name = req.body.name || '';
    record.email = req.body.email;
    record.password = hash;
    record.ip = ip;
    record.phone = req.body.phone || '';
    record.profile = req.body.profile || '';
    record.role = req.body.role;
    record
      .save()
      .then((udata) => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.errmsg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

users.updateUser = (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);

    const update = {
      name: req.body.name,
      phone: req.body.phone,
    },
      options = {
        upsert: false,
      };
    if (req.body.password) {
      const hash = bcrypt.hashSync(req.body.password, salt);
      update.password = hash;
    }
    Users.updateOne({ _id: req.params.id }, { $set: update }, options)
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



users.deleteUser = (req, res, next) => {
  // console.log(req.body);
  const id = req.body.id;
  // function removeFiles(image) {
  //   return new Promise((resolve, reject) => {
  //     const path = config.get('profile_directory');

  //     try {
  //       const f = path + image;
  //       console.log(f);
  //       fs.unlinkSync(f);
  //       resolve(true);
  //     } catch (err) {
  //       console.error(err);
  //       resolve(false);
  //     }
  //   });
  // }
  Users.findOne({ _id: id })
    .then(async (data) => {
      const a = await removeFiles(data.profile);
      await UserHistory.deleteMany({ user: id });
      data.delete().then((d) => res.json({ success: 'OK' }));
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

users.getRole = (req, res, next) => {
  const _id = req.uid;
  Users.findById(_id).then((data) => {
    res.json({ role: data.role });
  });
};


module.exports = users;
