const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const Users = require('../models/Users');
const UserHistory = require('../models/UserHistories');
const moment = require('moment');

const login = {};

login.loginCheck = (req, res, next) => {
  function addhistory(user) {
    return new Promise((resolve, reject) => {
      const queryDate = moment();
      const query = {
        user: user,
        logged_in: {
          $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
          $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        },
      };
      UserHistory.findOne(query).then((data) => {
        if (data) {
          resolve(data);
        } else {
          let record = new UserHistory();
          record.user = user;
          record.logged_in = new Date();
          record.status = 'loggedin';
          record
            .save()
            .then((data) => {
              resolve(data);
            })
            .catch((err) => reject(err));
        }
      });
    });
  }

  const { email, password, ...rest } = req.body;

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.replace('::ffff:', '');

  const allowedIps = [
    '103.164.67.236',
    '61.3.84.217',
    '117.208.66.136',
    '157.39.253.52',
    '157.38.125.214',
    '127.0.0.1',
    '132.154.186.204',
    '193.32.126.227',
    '103.163.58.218',
    '49.36.230.34',
    '198.54.134.125',
    '89.46.62.247',
    '198.54.134.157'
  ];
  console.log(ip, 'login ip');
  // if (allowedIps.indexOf(ip) > -1) {
    Users.findOne({ email: email, status: 'Active' }).then((udata) => {
      if (udata) {
        bcrypt.compare(password, udata.password).then(async (data) => {
          if (data) {
            //  console.log(udata);
            const a = await addhistory(udata._id);
            console.log('loggedin', a);
            const payload = {
              user: {
                uid: udata._id,
                role: udata.role,
                name: udata.name,
                email: udata.email,
                phone: udata.phone,
                profile: udata.profile,
              },
            };

            jwt.sign(
              payload,
              config.get('jwtSecret'),
              { expiresIn: '24h' },
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
            );
          } else {
            res.json({ error: 'Password mismatch' });
          }
        });
      } else {
        res.json({ error: 'Username Not found' });
      }
    });
  // } else {
  //   res.json({ error: 'Not allowed to login.' });
  // }
};

login.validToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    res.json({ error: 'Unauth' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, config.get('jwtSecret'));
    res.json({ message: 'valid' });
  } catch (err) {
    res.json({ error: err });
  }
};

login.logout = (req, res, next) => {
  function getDiff(start) {
    const a = new Date(start);
    return ((Date.now() - a.getTime()) / (1000 * 60 * 60)).toFixed(2);
  }
  const token = req.header('x-auth-token');
  if (!token) {
    return res.json({ error: 'Unauth' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    const queryDate = moment();
    const query = {
      user: decoded.user.uid,
      logged_in: {
        $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
        $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
      },
    };
    UserHistory.findOne(query)
      .then(async (record) => {
        if (!record) {
          return res.json({ success: 'NOK' });
        }
        record.logged_out = new Date();
        record.total_time = await getDiff(record.logged_in);
        record.status = 'loggedout';

        record
          .save()
          .then((data) => res.json({ success: 'OK' }))
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err });
      });
  } catch (err) {
    res.json({ error: err });
  }
};

module.exports = login;
