const mongoose = require('mongoose');
const path = require('path');
const Expenses = require('../models/Expense');
const Logs = require('../models/ExpensesLogs');
const moment = require('moment-timezone');

const expenses = {};
const expenseslog = {};

expenses.get = (req, res, next) => {
  Expenses.find({})
    .sort({ _id: -1 })
    .select({
      date: 1,
      expenseType: 1,
      amount: 1,
      remarks: 1
    })
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};
expenses.getCount = (req, res, next) => {
  Expenses.find({}).count()
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};

expenses.getDetails = (req, res, next) => {
  if (req.params.uid) {
    Expenses.aggregate([
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




expenses.insertExpense = (req, res, next) => {
  console.log(req.body, 'req insert expense')
  if (req.body) {
    let date = moment(req.body.expenseDate).format("YYYY-MM-DDT00:00:00");
    
    let record = new Expenses();
    record.date = date;
    record.expenseType = req.body.expenseType || null;
    record.amount = req.body.amount || '';
    record.remarks = req.body.remarks || '';

    record
      .save()
      .then((udata) => {
        res.json({ success: "OK" });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.msg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};


expenses.updateExpense = async (req, res, next) => {
  if (req.body) {
    console.log(req.body, 'update req body');
    let expensedate = moment(req.body.expenseDate).format("YYYY-MM-DDT00:00:00");
    let reqParm = [];
    await Expenses.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
      .select({
        date: 1,
        expenseType: 1,
        amount: 1,
        remarks: 1
      })
      .then((data) => {
        console.log(data, typeof data);
        reqParm[0] = data;
      })
      .catch((err) => {
        console.log(err);
      });
    const update = {
        date: expensedate,
        expenseType: req.body.expenseType,
        amount: req.body.amount,
        remarks: req.body.remarks
      },
      options = {
        upsert: false,
      };
    reqParm[1] = update;
    Expenses.updateOne({ _id: req.params.id }, { $set: update }, options)
      .then((udata) => {
        res.json({ success: 'OK' });
        // console.log(udata, udata_id, 'update response');
        let addLog = new Logs();
        addLog.expenseId = req.params.id;
        addLog.requestType = 'Expense Edited !';
        addLog.userId = req.body.userId;
        addLog.requestParameters = reqParm;

        addLog
          .save()
          .then((newlog) => {
            console.log(newlog);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        res.status(503).json({ err: err });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

expenses.getExpensesDetails = async ( req, res, next) => {
  let query = {};
  if (req.body) {
  let startDate = moment(req.body.startDate);
  let endDate = moment(req.body.endDate);
  query1 = { date: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } }; 
}
console.log(req.body.startDate, req.body.endDate,query, query1, 'query');
  Expenses.aggregate([
    { $match: query1},
  { $group: {_id: "$expenseType", totalExpenses: { $sum: "$amount" }}}
  ]).then((data) => {
    console.log(data, 'revenue api');
    res.json({ data: data });
  })
  .catch(next);
}


expenses.deleteExpense = async (req, res, next) => {
  var id = req.body.id;
  var reqParm = [];
  var userId = req.body.userId;
  console.log(id, userId, 'id and userid ')
  await Expenses.findOne({ _id: mongoose.Types.ObjectId(id) })
      .select({
        date: 1,
        expenseType: 1,
        amount: 1,
        remarks: 1
      })
      .then((data) => {
        reqParm[0] = data;
      })
      .catch((err) => {
        console.log(err);
      });
  Expenses.deleteOne({ _id: id }).then((d) => { 
    res.json({ success: 'OK' });
      reqParm[1] = {
        date: 'N/A',
        expenseType: 'N/A',
        amount: 'N/A',
        remarks: 'N/A'
        }
      let addLog = new Logs();
        addLog.expenseId = id;
        addLog.requestType = 'Expense Deleted !';
        addLog.userId = userId;
        addLog.requestParameters = reqParm;
        addLog
        .save()
        .then((newlog) => {
          console.log(newlog);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

module.exports = expenses;
