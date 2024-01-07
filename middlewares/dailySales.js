const writeXlsxFile = require('write-excel-file/node')

const jwt = require('jsonwebtoken');
const config = require('config');
const Orders = require('../models/Orders');
const moment = require('moment-timezone');
const {
  Telegram
} = require('telegraf');
const tg = new Telegram(process.env.TOKEN);
const schema = [
  // Column #1
  {
    column: 'Sr No:',
    type: Number,
    value: order => order.index
  },
  // Column #2
  {
    column: 'Order Number',
    type: String,
    value: order => order.magentoOrderId,
    width: 15 // Column width (in characters).

  },
  // Column #3
  {
    column: 'Customer Name',
    type: String,
    value: order => order.customerName,
    width: 25 // Column width (in characters).

  },
  // Column #4
  {
    column: 'State',
    type: String,
    value: order => order.state,
    width: 15 // Column width (in characters).

  },
  // Column #5
  {
    column: 'City',
    type: String,
    value: order => order.city,
    width: 15 // Column width (in characters).

  },
  // Column #6
  {
    column: 'PrePaid',
    type: Boolean,
    value: order => order.PrePaid,
    width: 10 // Column width (in characters).

  },
  
  // Column #7
  {
    column: 'Source',
    type: String,
    value: order => order.source,
    width: 25 // Column width (in characters).

  },
  // Column #8
  {
    column: 'Order Amount',
    type: Number,
    value: order => order.orderTotal,
    width: 15 // Column width (in characters).

  }

]

module.exports = async function dailySalesReport(){
  let DailyOrders = [];

  // let txt = '<a href="https://www.wisperinghomes.com/">WhisperingHomes</a> \n' + "<code> Today's Orders Report:</code> ";
  let endDate = moment();
  let startDate = moment();
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59"))}}; 
  console.log(startDate, endDate, query1,  'dates and query for orders');
  await Orders.aggregate([
    { $match: query1},
  { "$sort" : { "magentoOrderId": -1 }},
  ]).then(async (data) => {
    // console.log(data,'data');
   await data.map(async (item, key) => {
    let paymentMethod = false;
    let source = "Non-Assisted";
    if(item.address[0].mposc_field_2 !== null){
      source = item.address[0].mposc_field_2;
    }
    if(item.payment_method === "Paytm" || item.payment_method === "Cheque / e-Transfer"){
      paymentMethod = true;
    }
    //  txt += "<code>"+ key + " " + item['magentoOrderId'] + "</code>"+ "\n";
    DailyOrders.push({ "index": key + 1, "magentoOrderId": item.magentoOrderId, "customerName": item.address[0].firstname + ' ' + item.address[0].lastname, "state": item.address[0].region, "city": item.address[0].city, "PrePaid": paymentMethod , "source" : source , "orderTotal": item.orderGrandTotal });
   })
  })
      console.log(DailyOrders, 'orders Object');
      await writeXlsxFile(DailyOrders, {
        schema,
        filePath: './uploads/dailySales/dailySales.xlsx'
      }).then(() => {
        let txt = '<a href="http://crm.whisperinghomes.com:8443/uploads/dailySales/dailySales.xlsx">Daily Sales </a> \n' + "<code> Download Link for Sale</code> ";

        tg.sendMessage(process.env.GROUP_ID, txt,{parse_mode: 'HTML'});

        // console.log(data,'data');
       
      })
};

    
  
