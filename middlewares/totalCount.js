const Orders = require('../models/Orders');
const moment = require('moment-timezone');


module.exports = async function totalCount(ctx) {
  // let DailyOrders = [];
  let endDate = moment();
  let startDate = moment();
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  console.log(startDate, endDate, query1, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $group: { _id: null, cost: { $sum: "$orderGrandTotal" } } }]).then(async (data) => {
	console.log(data, 'data');
      if(data.length !== 0) {
       await data.map(async (item, key) => {
        console.log(item.cost, "query count data");
	ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + item['cost'] +'\n' );
       });
	}
	else {
        ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + '0' +'\n' );
 	}
      })
}
