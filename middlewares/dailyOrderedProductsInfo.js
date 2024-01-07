  const Orders = require('../models/Orders');
  const moment = require('moment-timezone');
  // let DailyOrders = [];

  module.exports = async function dailyOrderedProductsInfo(ctx) {

  //let endDate = moment();
  //let startDate = moment();
  let startDate = moment().month(6).startOf('month');
  let endDate = moment().month(6).endOf('month');
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  console.log(startDate, endDate, query1, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $group: { _id: null, Products: { $push: "$orderDetails.sku" } } }]).then(async (data) => {
	 await console.log(data[0].Products, 'data');
	 await data[0].Products.map(async (items, keys) => {
	 await  console.log(items, "product sku"); 
	})

      })
    }
