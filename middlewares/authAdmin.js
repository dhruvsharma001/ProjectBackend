const jwt = require('jsonwebtoken');
const config = require('config');
const Users = require('../models/Users');

module.exports = (accessRoles) => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    // console.log(token, 'dsfsdfssfd');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized 1' });
    }
    if (token == 'undefined') {
      return res.status(401).json({ error: 'Undefined Token Error' });
    }

    try {
      const decoded = jwt.verify(token, config.get('jwtSecret'));
      //   console.log(accessRoles, decoded, 'token verfication...');
      const _id = decoded.user.uid;
      req.uid = decoded.user.uid;

      Users.findOne({ _id })
        .then((data) => {
          //console.log(data.role)
          if (!data) {
            return res.status(401).json({ error: 'User not found!' });
          }
        })
        .catch((err) => console.log(err));
      if (accessRoles[decoded.user.role]) {
        next();
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      console.log(err, 'check');
      return res.status(401).json({ error: 'Token Expired' });
    }
  };
};
