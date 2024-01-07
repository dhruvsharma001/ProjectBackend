const log = require('express').Router();
const logController = require('../controllers/log');
const authAdmin = require('../middlewares/authAdmin');

log.post('/add', logController.add);
log.post('/get', logController.get);
log.post('/getOrderLogs', logController.getOrderLogs);
log.post('/getExpensesLogs', logController.getExpensesLogs);
module.exports = log;
