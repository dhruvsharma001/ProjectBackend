const Orders = require('../models/Orders');
const moment = require('moment-timezone');


module.exports = async function dailySalesInfo(ctx) {
  // let DailyOrders = [];
  let endDate = moment();
  let startDate = moment();
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  console.log(startDate, endDate, query1, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $unwind: "$orderDetails"},
    { $group: { _id: null,
  salesWH: {$sum: { $cond: {if: {$eq: ["$orderDetails.soldBy", "Whispering Homes"]}, then: {"$subtract" : [{$multiply: ["$orderDetails.price", {$toDouble: "$orderDetails.qty_ordered"}]}, {$toDouble: "$orderDetails.discountPrice"}]} , else: 0 } }},

  salesTotal: {$sum: { $cond: {if: { $ne: ["$orderDetails.soldBy", "Whispering Homes"]}, then: { "$subtract" : [{$multiply: ["$orderDetails.price", {$toDouble: "$orderDetails.qty_ordered"}]}, {$toDouble: "$orderDetails.discountPrice"}]} , else: 0 } }},

  totalItemsSold: { $sum: {$toDouble: "$orderDetails.qty_ordered" }},
  whItemsSold: {$sum: { $cond: { if: {$eq: ["$orderDetails.soldBy", "Whispering Homes"]}, then: {$toDouble: "$orderDetails.qty_ordered"}, else: 0 }}}}}]).then(async (data) => {
        console.log(data, 'data');
      if((data[0].totalItemsSold > 0) && (data[0].whItemsSold > 0)){
          let percentage = (data[0].whItemsSold/data[0].totalItemsSold)*100;
          let revPercentage = (data[0].salesWH/(data[0].salesTotal + data[0].salesWH))*100;
	  let totalSalesAmount = (data[0].salesTotal + data[0].salesWH);
          ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝙿𝚛𝚘𝚍𝚞𝚌𝚝𝚜 𝚜𝚘𝚕𝚍 (𝚝𝚘𝚍𝚊𝚢): " + data[0].totalItemsSold +'\n' + "𝚃𝚘𝚝𝚊𝚕 (𝚆𝙷) 𝙿𝚛𝚘𝚍𝚞𝚌𝚝𝚜 𝚜𝚘𝚕𝚍 (𝚝𝚘𝚍𝚊𝚢) :" + data[0].whItemsSold +'\n' + "𝚆𝙷 𝚙𝚛𝚘𝚍𝚞𝚌𝚝𝚜 % (𝚝𝚘𝚍𝚊𝚢): " + percentage.toFixed(2) +'%'+ '\n' + "𝚃𝚘𝚝𝚊𝚕 𝚜𝚊𝚕𝚎𝚜 𝚊𝚖𝚘𝚞𝚗𝚝 (𝚁𝚜): " + totalSalesAmount.toFixed(2) + '\n'+ "𝚃𝚑𝚒𝚛𝚍 𝙿𝚊𝚛𝚝𝚢 𝚜𝚊𝚕𝚎𝚜 𝚊𝚖𝚘𝚞𝚗𝚝: (𝚁𝚜): "+ data[0].salesTotal.toFixed(2) + '\n' + "𝚆𝙷 𝚜𝚊𝚕𝚎𝚜 𝚊𝚖𝚘𝚞𝚗𝚝 (𝚁𝚜): " + data[0].salesWH.toFixed(2) + '\n' + "𝚆𝙷 𝚜𝚊𝚕𝚎 (%): " + revPercentage.toFixed(2) + '%' + '\n' );
      }else {
            ctx.reply("𝚃𝚘𝚝𝚊𝚕 𝙿𝚛𝚘𝚍𝚞𝚌𝚝𝚜 𝚜𝚘𝚕𝚍 (𝚝𝚘𝚍𝚊𝚢): " + data[0].totalItemsSold +'\n' + "𝚃𝚘𝚝𝚊𝚕 (𝚆𝙷) 𝙿𝚛𝚘𝚍𝚞𝚌𝚝𝚜 𝚜𝚘𝚕𝚍 (𝚝𝚘𝚍𝚊𝚢) :" + data[0].whItemsSold +'\n');
      }
      })
}

