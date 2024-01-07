const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Users = require('../models/Users');
const OrderLogs = require('../models/OrderLogs');
const Logs = require('../models/Logs');
const ExpensesLogs = require('../models/ExpensesLogs');

const logs = {};

logs.add = (req, res, next) => {
  if (req.body) {
    let record = new Logs();
    record.userId = req.body.userId;
    record.productId = req.body.productId;
    record.requestType = req.body.requestType;
    record.requestParameters = req.body.requestParameters || [];
    record
      .save()
      .then((data) => {
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.errmsg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};
logs.getOrderLogs = (req, res, next) => {
  let query = {};
  if (req.body.uid) {
    query.userId = mongoose.Types.ObjectId(req.body.uid);
    console.log(req.body.uid, 'get order logs userId');

  }
  OrderLogs.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'User',
      },
    },
    {
      $unwind: '$User',
    },
    {
      $addFields: {
        User_Name: '$User.name',
      },
    },
    {$sort : {createdAt: -1}},
    {
      $project: {
        requestType: 1,
        requestParameters: 1,
        User_Name: 1,
        orderId: 1,
        magentoOrderId: 1,
        createdAt: 1,
      },
    },
  ])
    .then((data) => {
      res.json({ data: data });
    })
    .catch(next);
};

logs.get = (req, res, next) => {
  let query = {};
  if (req.body.uid) {
    query.userId = mongoose.Types.ObjectId(req.body.uid);
  }
  console.log(req.body.uid, '0000000000000000');
  Logs.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'User',
      },
    },
    {
      $unwind: '$User',
    },
    // {
    //   $lookup: {
    //     from: 'products',
    //     localField: 'productId',
    //     foreignField: '_id',
    //     as: 'Product',
    //   }
    // },
    // {
    //   $unwind: '$Product',
    // },
    {
      $addFields: {
        User_Name: '$User.name',
        // Product_Name: '$Product.name',
      },
    },
    {$sort : {createdAt: -1}},

    {
      $project: {
        requestType: 1,
        requestParameters: 1,
        User_Name: 1,
        // Product_Name: 1,
        orderId: 1,
        createdAt: 1,
      },
    },
  ])
    .then((data) => {
      res.json({ data: data });
    })
    .catch(next);
};




logs.getExpensesLogs = (req, res, next) => {
  let query = {};
  if (req.body.uid) {
    query.userId = mongoose.Types.ObjectId(req.body.uid);
  }
  console.log(req.body.uid, '0000000000000000');
  ExpensesLogs.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'User',
      },
    },
    {
      $unwind: '$User',
    },
    // {
    //   $lookup: {
    //     from: 'products',
    //     localField: 'productId',
    //     foreignField: '_id',
    //     as: 'Product',
    //   }
    // },
    // {
    //   $unwind: '$Product',
    // },
    {
      $addFields: {
        User_Name: '$User.name',
        // Product_Name: '$Product.name',
      },
    },
    {$sort : {createdAt: -1}},

    {
      $project: {
        requestType: 1,
        requestParameters: 1,
        User_Name: 1,
        // Product_Name: 1,
        expenseId: 1,
        createdAt: 1,
      },
    },
  ])
    .then((data) => {
      res.json({ data: data });
    })
    .catch(next);
};
module.exports = logs;
