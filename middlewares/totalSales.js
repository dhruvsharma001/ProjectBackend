const Orders = require('../models/Orders');
const moment = require('moment-timezone');


module.exports = async function totalSales(ctx) {
  // let DailyOrders = [];
  let endDate = moment();
  let startDate = moment();
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  console.log(startDate, endDate, query1, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $count: "sales" }]).then(async (data) => {
	console.log(data, 'data qeury');     
  if(data.length !== 0){
  await data.map(async (item, key) => {
        ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙲𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " +  item['sales']);
      });
  }
 else {
 ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙲𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " +  "0");

 }
    })
}
