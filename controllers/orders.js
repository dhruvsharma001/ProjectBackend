const axios = require('axios')
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const Orders = require('../models/Orders');
const Products = require('../models/Products');
const Logs = require('../models/Logs');
const OrderLogs = require('../models/OrderLogs');
const moment = require('moment-timezone');
const {
  Telegram
} = require('telegraf');
const tg = new Telegram(process.env.TOKEN);
const Customers = require('../models/Customers');

const orders = {};

orders.telegram = (req, res, next) => {
  console.log(req.body) // Call your action on the request here
  res.status(200).end() // Responding is important
};

orders.zohoWebhook = (req, res, next) => {
  console.log(req, req.body, 'zoho req body');
  res.sendStatus(200);
};

orders.orderedProductsInfo = async (req, res, next) => {
  let startDate = moment().month(6).startOf('month');
  let endDate = moment().month(6).endOf('month');
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  console.log(startDate, endDate, query1, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $group: { _id: null, Products: { $push: "$orderDetails.sku" } } }]).then(async (data) => {
      await console.log(data[0].Products, 'data');
      //await data[0].Products.map(async (items, keys) => {
      // await  console.log(items, "product sku"); 
      res.json({ data: data[0].Products });
    }).catch(next);
};

orders.deliveryImageUpdate = (req, res, next) => {
  const update = {
    receiptImage: (req.file) ? req.file.filename : null,
    shippingCost: req.body.shippingCost,
  },
    option = {
      upsert: false,
    };
  Orders.updateOne({ _id: req.body.orderId }, { $set: update }, option)
    .then(() => { res.json({ success: 'OK' }) }
    ).catch((err) =>
      console.log(err, 'error ')
    )
};


orders.get = (req, res, next) => {
  if (req.body) {
    console.log(req.body.endDate, 'end date')
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  }
  Orders.aggregate([
    { $match: query1 },
    { "$sort": { "magentoOrderId": -1 } },

  ]).then((data) => {
    // console.log(data, 'get orders by date');
    res.json({ data: data });
  })
    .catch(next);




  // Orders.find({}).sort({magentoOrderId: -1}).then((data) => {
  //   if (data) {
  //     res.json({ data: data });
  //   } else {
  //     res.json({ error: 'Empty Set' });
  //   }
  // });
};



orders.getCount = (req, res, next) => {
  Orders.find({ status: 'Delivered' })
    .count()
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};

orders.getDeliveryStatus = (req, res, next) => {
  const deliveryToken = 'f6f5f62e5de660c609fcf3eb35e447a3def0a45a';

  if (req.body) {
    let waybill = req.body.waybill;
    try {
      return axios({
        method: 'GET',
        url: `https://track.delhivery.com/api/v1/packages/json/?token=${deliveryToken}&waybill=${waybill}`,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }).then((responseData) => {
        console.log(responseData.data, 'response from api');
        res.json({ data: responseData.data });
      }).catch((err) =>
        console.log(err, 'error fetching Delivery Status from API')
      );
    } catch (error) {
      console.error(error)
    }
  }
}


orders.addOrderCc = async (req, res, next) => {
  console.log(req, 'addOrderCC!!')
  if (req.body) {
    console.log(req.body, 'Cc avenue order req body');

  }
};

orders.addReOrder = async (req, res, next) => {
  if (req.body) {
    console.log(req.body, 'order reqbody')
  }
}


orders.addAdminOrder = async (req, res, next) => {
  let txt = '<a href="https://www.wisperinghomes.com/">𝕎𝕙𝕚𝕤𝕡𝕖𝕣𝕚𝕟𝕘 ℍ𝕠𝕞𝕖𝕤</a> \n' + "<code>🄱🄰🄲🄺🄴🄽🄳 </code>" + "\n" + "<code> Recieved an order from: </code> ";
  let orderDate = moment().format("YYYY-MM-DDT00:00:00");
  let newCustomer = "Existing Customer";
  let discountPercentage = 0;
  if (req.body) {

    discountPercentage = (req.body.discountAmount / req.body.orderTotalInclTax) * 100;
    console.log(req.body, 'order req body');
    const customerCheck = await Orders.findOne({ customerEmail: req.body.customerEmail });
    if (customerCheck) {
      txt += ` \n <strong> Customer Info: </strong> <code> ${newCustomer}</code>`;

      console.log("Customer exists");
    } else {
      newCustomer = "New Customer";
      txt += ` \n <strong> Customer Info: </strong> <code> ${newCustomer}</code>`;
    }
    if (req.body.bad) {
      req.body.address.map((item, key) => {
        txt += ` \n <strong> ${item["firstname"]}</strong> <strong> ${item["lastname"]}</strong> <code> ${req.body.customerEmail}</code> \n<strong>Contact</strong> <pre> ${item["telephone"]}</pre> \n <strong>Address:</strong> <pre> ${item["street"]}</pre> <code> ${item["city"]}  ${item["region"]} </code> \n <strong>Order Details: </strong> \n `;
      });
    }
    else {
      txt += ` \n <strong> ${req.body.address["firstname"]}</strong> <strong> ${req.body.address["lastname"]}</strong> <code> ${req.body.address["email"]}</code> \n <strong>Order Source:</strong> \n <code> ${(req.body.address["mposc_field_2"] !== null) ? req.body.address["mposc_field_2"] : "Non-Assisted"} </code> \n<strong>Contact</strong> <code> ${req.body.address["telephone"]}</code> \n <strong>Address:</strong> <pre> ${req.body.address["street"]}</pre> <code> ${req.body.address["city"]}  ${req.body.address["region"]} </code> \n <strong>Order Details: </strong> \n `;
    }
    if (req.body.orderDate) {
      orderDate = moment(req.body.orderDate).format("YYYY-MM-DDT00:00:00");
      console.log(orderDate, 'orderDate')
    }
    await req.body.orderDetails.map(async (item, key) => {
      txt += "<code>" + "# " + " " + item['name'] + " X " + item["qty_ordered"] + "</code>" + "\n" + ` <strong> Sold By: </strong> ` + "<code>" + item['soldBy'] + "</code>" + "\n";
      if (item['soldBy'] === 'Whispering Homes') {
        try {
          const product = await Products.findOne({ SKU: item['sku'] });
          if (product) {
            let updatedQuantity = parseInt(product.quantity) - parseInt(item["qty_ordered"]);
            let stockMsg = "<strong>" + item['name'] + " " + "</strong>" + "<code>" + "Remaining Quantity:" + " " + updatedQuantity + "</code>" + "\n";
            await tg.sendMessage(process.env.GROUP_ID, stockMsg, { parse_mode: 'HTML' });
            await Products.updateOne({ SKU: item['sku'] }, { $set: { quantity: updatedQuantity } }, {
              new: true, upsert: true
            }).then(async (data) => {
              console.log(data, 'updated product data');
            })
          }
          else {
            console.log('Product not found!');
          }

        } catch (error) {
          console.error('Error finding product:', error);
        }
      }
      // if(item["qty_ordered"] === item["qty_invoiced"]){
      //   txt += "<strong>"+ "Payment Mode:" + "</strong>" + "<code>"+"PrePaid"+"</code>"+ "\n";
      // }else {
      //   txt += "<strong>"+ "Payment Mode:" + "</strong>" + "<code>"+"COD"+"</code>"+ "\n";
      // }
      await tg.sendPhoto(process.env.GROUP_ID, item['image_url']);
    });
    if (req.body.payment_method !== null) {
      txt += "<strong>" + "Payment Mode:" + "</strong>" + "<code>" + " " + req.body.payment_method + "</code>" + "\n";
    } else {
      txt += "<strong>" + "Payment Mode:" + "</strong>" + "<code>" + " " + "PayTm" + "</code>" + "\n";
    }

    txt = txt + "<strong>" + "Order Amount Paid Rs " + req.body.orderGrandTotal + "</strong>" + "\n" + "<strong>" + "Discount Amount  Rs " + "</strong>" + "<code>" + req.body.discountAmount + "</code>" + "\n" + "<strong>" + "Discount Percentage " + "</strong>" + "<code>" + discountPercentage + "%" + "</code>" + "\n";

    await tg.sendMessage(process.env.GROUP_ID, txt, { parse_mode: 'HTML' });
    let record = new Orders();
    record.magentoOrderId = req.body.magentoOrderId || '';
    record.orderedProducts = req.body.orderedProducts || null;
    record.discountAmount = req.body.discountAmount || null;
    record.couponCode = req.body.couponCode || '';
    record.guest = req.body.guest || '0';
    record.shippingDiscountAmount = req.body.shippingDiscountAmount || null;
    record.shippingAmount = req.body.shippingAmount || null;
    record.orderTotalInclTax = req.body.orderTotalInclTax || null;
    record.orderGrandTotal = req.body.orderGrandTotal || null;
    record.orderCurrencyCode = req.body.orderCurrencyCode || 'INR';
    record.magentoCustomerId = req.body.magentoCustomerId || '';
    record.customerEmail = req.body.customerEmail || '';
    record.orderDetails = req.body.orderDetails || [];
    record.remote_ip = req.body.remote_ip || '';
    record.magentoShippingAddressId = req.body.magentoShippingAddressId || '';
    record.address = req.body.address || [];
    record.storeName = req.body.storeName || 'Whispering Homes';
    record.comments = req.body.comments || "Order added by magento event!";
    record.orderDate = orderDate;
    record.mailReport = [{ name: "Pending", value: 0, date: Date.now() }];
    if (req.body.payment_method == null) {
      record.payment_method = "Paytm"
    } else {
      record.payment_method = req.body.payment_method;
    }
    record.orderSource = req.body.address["mposc_field_2"] || 'Non-Assisted';
    await record
      .save()
      .then(async (udata) => {
        let endDate = moment();
        let startDate = moment();
        query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
        await Orders.aggregate([
          { $match: query1 },
          { $group: { _id: null, cost: { $sum: "$orderGrandTotal" } } }]).then(async (data) => {
            if (data.length !== 0) {
              await data.map(async (item, key) => {
                let salesText = "𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + item['cost'] + '\n';
                await tg.sendMessage(process.env.GROUP_ID, salesText, { parse_mode: 'HTML' });
              });
            }
            else {
              let salesText = "𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + "0";
              tg.sendMessage(process.env.GROUP_ID, salesText, { parse_mode: 'HTML' });
            }
          })
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.msg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};



orders.liveAccess = async (req, res, next) => {
  if (req.body) {
    console.log(req.body.User, 'ssh login');
  }
}

orders.addOrder = async (req, res, next) => {
  let txt = '<a href="https://www.wisperinghomes.com/">𝕎𝕙𝕚𝕤𝕡𝕖𝕣𝕚𝕟𝕘 ℍ𝕠𝕞𝕖𝕤</a> \n' + "<code>🄵🅁🄾🄽🅃🄴🄽🄳 </code>" + "\n" + "<code> Recieved an order from:</code> ";
  let orderDate = moment().format("YYYY-MM-DDT00:00:00");
  let newCustomer = "Existing Customer";
  let discountPercentage = 0;
  if (req.body) {

    discountPercentage = (req.body.discountAmount / req.body.orderTotalInclTax) * 100;
    const customerCheck = await Orders.findOne({ customerEmail: req.body.customerEmail });
    if (customerCheck) {
      txt += ` \n <strong> Customer Info: </strong> <code> ${newCustomer}</code>`;
      console.log("Customer exists");
    } else {
      newCustomer = "New Customer";
      txt += ` \n <strong> Customer Info: </strong> <code> ${newCustomer}</code>`;
    }
    if (req.body.bad) {
      req.body.address.map((item, key) => {
        txt += ` \n <strong> ${item["firstname"]}</strong> <strong> ${item["lastname"]}</strong> <code> ${req.body.customerEmail}</code> \n<strong>Contact</strong> <pre> ${item["telephone"]}</pre> \n <strong>Address:</strong>  <pre> ${item["street"]}</pre> <code> ${item["city"]}  ${item["region"]} </code> \n <strong>Order Details: </strong> \n `;
      });
    }
    else {
      txt += ` \n <strong> ${req.body.address["firstname"]}</strong> <strong> ${req.body.address["lastname"]}</strong> <code> ${req.body.address["email"]}</code> \n <strong>Order Source:</strong> \n <code> ${(req.body.address["mposc_field_2"] !== null) ? req.body.address["mposc_field_2"] : "Non-Assisted"} </code> \n<strong>Contact</strong> <code> ${req.body.address["telephone"]}</code> \n <strong>Address:</strong>  <pre> ${req.body.address["street"]}</pre> <code> ${req.body.address["city"]}  ${req.body.address["region"]} </code> \n <strong>Order Details: </strong> \n `;
    }
    if (req.body.orderDate) {
      orderDate = moment(req.body.orderDate).format("YYYY-MM-DDT00:00:00");
      console.log(orderDate, 'orderDate')
    }
    await req.body.orderDetails.map(async (item, key) => {
      txt += "<code>" + "# " + " " + item['name'] + " X " + item["qty_ordered"] + "</code>" + "\n" + ` <strong> Sold By: </strong> ` + "<code>" + item['soldBy'] + "</code>" + "\n";
      if (item['soldBy'] === 'Whispering Homes') {
        try {
          const product = await Products.findOne({ SKU: item['sku'] });
          if (product) {
            let updatedQuantity = parseInt(product.quantity) - parseInt(item["qty_ordered"]);
            let stockMsg = "<strong>" + item['name'] + " " + "</strong>" + "<code>" + "Remaining Quantity:" + " " + updatedQuantity + "</code>" + "\n";
            await tg.sendMessage(process.env.GROUP_ID, stockMsg, { parse_mode: 'HTML' });
            await Products.updateOne({ SKU: item['sku'] }, { $set: { quantity: updatedQuantity } }, {
              new: true, upsert: true
            }).then(async (data) => {
              console.log(data, 'updated product data');
            })
          }
          else {
            console.log('Product not found!');
          }
        } catch (error) {
          console.error('Error finding product:', error);
        }
      }
      // if(item["qty_ordered"] === item["qty_invoiced"]){
      //   txt += "<strong>"+ "Payment Mode:" + "</strong>" + "<code>"+"PrePaid"+"</code>"+ "\n";
      // }else {
      //   txt += "<strong>"+ "Payment Mode:" + "</strong>" + "<code>"+"COD"+"</code>"+ "\n";
      // }
      await tg.sendPhoto(process.env.GROUP_ID, item['image_url']);
    });
    if (req.body.payment_method !== null) {
      txt += "<strong>" + "Payment Mode:" + "</strong>" + "<code>" + " " + req.body.payment_method + "</code>" + "\n";
    } else {
      txt += "<strong>" + "Payment Mode:" + "</strong>" + "<code>" + " " + "PayTm" + "</code>" + "\n";
    }
    // txt += "<strong>"+ "Payment Mode:" + "</strong>" + "<code>"+ req.body.payment_method+"</code>"+ "\n";
    //discountPercentage
    txt = txt + "<strong>" + "Order Amount Paid Rs " + req.body.orderGrandTotal + "</strong>" + "\n" + "<strong>" + "Discount Amount  Rs " + "</strong>" + "<code>" + req.body.discountAmount + "</code>" + "\n" + "<strong>" + "Discount Percentage " + "</strong>" + "<code>" + discountPercentage + "%" + "</code>" + "\n";

    await tg.sendMessage(process.env.GROUP_ID, txt, { parse_mode: 'HTML' });
    let record = new Orders();
    record.magentoOrderId = req.body.magentoOrderId || '';
    record.orderedProducts = req.body.orderedProducts || null;
    record.discountAmount = req.body.discountAmount || null;
    record.couponCode = req.body.couponCode || '';
    record.guest = req.body.guest || '0';
    record.shippingDiscountAmount = req.body.shippingDiscountAmount || null;
    record.shippingAmount = req.body.shippingAmount || null;
    record.orderTotalInclTax = req.body.orderTotalInclTax || null;
    record.orderGrandTotal = req.body.orderGrandTotal || null;
    record.orderCurrencyCode = req.body.orderCurrencyCode || 'INR';
    record.magentoCustomerId = req.body.magentoCustomerId || '';
    record.customerEmail = req.body.customerEmail || '';
    record.orderDetails = req.body.orderDetails || [];
    record.remote_ip = req.body.remote_ip || '';
    record.magentoShippingAddressId = req.body.magentoShippingAddressId || '';
    record.address = req.body.address || [];
    record.storeName = req.body.storeName || 'Whispering Homes';
    record.comments = req.body.comments || "Order added by magento event!";
    record.orderDate = orderDate;
    record.mailReport = [{ name: "Pending", value: 0, date: Date.now() }];
    if (req.body.payment_method == null) {
      record.payment_method = "Paytm"
    } else {
      record.payment_method = req.body.payment_method;
    }
    record.orderSource = req.body.address["mposc_field_2"] || 'Non-Assisted';
    await record
      .save()
      .then(async (udata) => {

        let endDate = moment();
        let startDate = moment();
        query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
        await Orders.aggregate([
          { $match: query1 },
          { $group: { _id: null, cost: { $sum: "$orderGrandTotal" } } }]).then(async (data) => {
            if (data.length !== 0) {
              await data.map(async (item, key) => {
                let salesText = "𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + item['cost'] + '\n';
                await tg.sendMessage(process.env.GROUP_ID, salesText, { parse_mode: 'HTML' });
              });
            }
            else {
              let salesText = "𝚃𝚘𝚝𝚊𝚕 𝚂𝚊𝚕𝚎𝚜 𝙰𝚖𝚘𝚞𝚗𝚝 (𝚝𝚘𝚍𝚊𝚢): " + "0";
              tg.sendMessage(process.env.GROUP_ID, salesText, { parse_mode: 'HTML' });
            }
          })


        // console.log(udata, 'order record');
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        console.log(err);
        // res.status(503).json({ err: err.msg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

orders.getThirdPartyOrders = async (req, res, next) => {
  if (req.body) {
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };

  }
  Orders.aggregate([
    { $match: query1 },
    { $unwind: "$orderDetails" },
    // { $group: {_id: "$orderDetails.sku", "orderId": "$magentoOrderId"}},
    {
      $lookup: {
        from: 'products',
        localField: 'orderDetails.sku',
        foreignField: 'SKU',
        as: 'ProductDetails'
      }
    },
    {
      $match: { "ProductDetails.productType": "Third Party" }
    },
    { $group: { _id: "$magentoOrderId" } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'magentoOrderId',
        as: 'OrderDetails'
      }
    }


  ]).then((data) => {
    console.log(data, 'third party orders');
    res.json({ data: data });
  })
    .catch(next);
}
orders.getSoldItems = async (req, res, next) => {
  let query = {};
  if (req.body) {
    query.status = "Delivered";
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  }
  Orders.aggregate([
    { $match: query1 },
    { $match: query },
    { $unwind: "$orderDetails" },
    // {
    //   $match: { "$orderDetails.product_id": null }
    // }
    // { $group: {_id: "$orderDetails.sku","orderId": {"$last": "$magentoOrderId"
    // },  sold: {$sum : { $toDouble: "$orderDetails.qty_ordered" }}}},
    { $group: { _id: "$orderDetails.sku", sold: { $sum: { $toDouble: "$orderDetails.qty_ordered" } } } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'SKU',
        as: 'ProductDetails'
      }
    },

  ]).then((data) => {
    console.log(data, 'sold items api');
    res.json({ data: data });
  })
    .catch(next);

}
orders.getRevenueDetails = async (req, res, next) => {
  let query = {};
  if (req.body) {
    query.status = "Delivered";
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  }
  console.log(req.body.startDate, req.body.endDate, query, query1, 'query');
  Orders.aggregate([
    { $match: query },
    { $match: query1 },
    { $group: { _id: "$magentoOrderId", total: { $sum: "$orderGrandTotal" } } },
    { "$sort": { "_id": 1 } },

  ]).then((data) => {
    console.log(data, 'revenue api');
    res.json({ data: data });
  })
    .catch(next);
}


orders.getOrdersCount = async (req, res, next) => {
  let query = {};
  if (req.body) {
    query.status = "Delivered";
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  }
  console.log(req.body.startDate, req.body.endDate, query, query1, 'query');
  Orders.aggregate([
    { $match: query },
    { $match: query1 },
    { $group: { _id: "$magentoOrderId", total: { $sum: "$orderGrandTotal" } } },
    {
      $count: "no_of_delivered_orders"
    }
  ]).then((data) => {
    console.log(data, 'revenue api');
    res.json({ data: data });
  })
    .catch(next);
}
orders.getYearlyChartInfo = async (req, res, next) => {
  let query = {};
  // let startDate = moment(req.body.startDate);
  // let endDate = moment(req.body.endDate);
  // query1 = { createdAt: { $gte: new Date(startDate.format('YYYY-MM-DDT00:00:00')), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
  let Data = [];
  let Data1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let Data2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  await months.map(async (key, value) => {
    let startDate = moment().month(value).startOf('month');
    let endDate = moment().month(value).endOf('month');
    console.log(startDate, endDate, "dates");
    let query1 = { orderDate: { $gte: new Date(startDate.format('YYYY-MM-DDT00:00:00')), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };
    await Orders.aggregate([
      { $match: query1 },
      {
        $group: {
          _id: null,
          orderTotal: { $sum: "$orderGrandTotal" },
          orderCount: { $sum: 1 },
        }
      }
    ]).then((data) => {
      console.log(data[0], Data, value, 'now')
      if (data[0]) {
        Data1.splice(value, 1, data[0].orderCount);
        Data2.splice(value, 1, data[0].orderTotal);
        // Data.slice(value, 1, data[0].orderTotal)

        // Data1.push(data[0].orderCount);
        // Data2.push(data[0].orderTotal)
      }
      // else{
      //   Data1.push(0);
      //   Data2.push(0);

      // }
    })

    // if(Data1.length >= 12){
    //   Data.push(Data1);
    //   Data.push(Data2);
    //   console.log(Data ,'all data')
    //   res.json({data: Data});
    // }

    if (value >= 11) {
      Data.push(Data1);
      Data.push(Data2);
      res.json({ data: Data });

    }
  })
}
orders.getOrdersCost = async (req, res, next) => {
  let query = {};
  if (req.body) {
    query.status = "Delivered";
    let startDate = moment(req.body.startDate);
    let endDate = moment(req.body.endDate);
    query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) } };

  }
  Orders.aggregate([
    { $match: query },
    { $match: query1 },
    {
      $unwind: '$orderDetails',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orderDetails.sku',
        foreignField: 'SKU',
        as: 'ProductDetails'
      }
    },
    { $unwind: '$ProductDetails' },
    {
      $addFields: {
        BuyingPrice: '$ProductDetails.BuyingPrice',
        QuantityOrdered: { $toDouble: "$orderDetails.qty_ordered" }
      }
    },
    {
      $addFields: {
        TotalBuyingPrice: { $multiply: ["$BuyingPrice", "$QuantityOrdered"] },
      }
    },
    // {
    //   $addFields: {
    //     TotalBuyingPrice: {$add: ["$SumTotalBuyingPrice", "$ShippingCost"]},
    // }},
    {
      $project: {
        magentoOrderId: 1,
        BuyingPrice: 1,
        QuantityOrdered: 1,
        TotalBuyingPrice: 1,
        shippingCost: 1
      }
    },
    {
      $group: {
        _id: '$magentoOrderId',
        shipping: { $first: '$shippingCost' },
        orderBuyingPrice: { $sum: "$TotalBuyingPrice" }

      }
    },
    { "$sort": { "_id": 1 } },
    {
      $project: {
        _id: 1,
        orderBuyingPrice: { $add: ["$orderBuyingPrice", "$shipping"] },

      }
    }


  ]).then((data) => {
    res.json({ data: data });
  })
    .catch(next);

}

orders.editStatus = async (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);
    let userId = req.params.id;
    let orderId = req.body.orderId;
    let reqParms = [];
    let magentoOrderId = req.body.magentoOrderId;
    reqParms[0] = {
      oldStatus: req.body.oldStatus,
      waybillArray: req.body.oldWaybillArray,
      // shippingCost: req.body.oldShippingCost,
      comments: req.body.oldComments,
      orderDate: moment(req.body.oldOrderDate).format("YYYY-MM-DDT00:00:00")
    };
    reqParms[1] = {
      newStatus: req.body.status,
      waybillArray: req.body.waybillArray,
      // shippingCost: req.body.shippingCost,
      comments: req.body.comments,
      orderDate: moment(req.body.orderDate).format("YYYY-MM-DDT00:00:00")
    };

    if (req.body.status === 'Delivered' && req.body.oldStatus !== 'Delivered') {
      await Orders.findOne({ _id: req.body.orderId }).then(async (data) => {
        console.log(data, 'order details for product to be edited !!');
        let length = data.orderDetails.length;
        for (let i = 0; i < length; i++) {
          let reqParm = [];
          let sku = data.orderDetails[i].sku;
          let quantity = data.orderDetails[i].qty_ordered;
          let productId = '';

          await Products.findOne({ SKU: sku })
            .select({
              name: 1,
              quantity: 1,
              SKU: 1,
              HSN: 1,
              BuyingPrice: 1,
              SellingPrice: 1,
              Category: 1,
              imageUrl: 1,
            })
            .then((data) => {
              // console.log(data, typeof data);
              reqParm[0] = data;
              productId = data._id;
            })
            .catch((err) => {
              console.log(err);
            });
          let updatedQuantity = reqParm[0].quantity - quantity;
          console.log(updatedQuantity, reqParm[0], 'new updated quantity');
          let update = {
            name: reqParm[0].name,
            quantity: updatedQuantity,
            SKU: reqParm[0].SKU,
            HSN: reqParm[0].HSN,
            BuyingPrice: reqParm[0].BuyingPrice,
            SellingPrice: reqParm[0].SellingPrice,
            Category: reqParm[0].Category,
            imageUrl: reqParm[0].imageUrl,
            _id: productId,
          };
          options = {
            upsert: false,
          };
          reqParm[1] = update;
          await Products.updateOne({ SKU: sku }, { $set: update }, options)
            .then((udata) => {
              console.log(udata, 'update response');
              let addLog = new Logs();
              addLog.productId = productId;
              addLog.requestType = 'Product Edited On Order Status Delivered !';
              addLog.userId = userId;
              addLog.requestParameters = reqParm;
              addLog.orderId = magentoOrderId;
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
              console.log(err, 'error with update products');
              // res.status(503).json({ err: err });
            });
        }
      });
    }



    const update = {
      status: req.body.status,
      waybillArray: req.body.waybillArray,
      // shippingCost: req.body.shippingCost,
      comments: req.body.comments,
      orderDate: moment(req.body.orderDate).format("YYYY-MM-DDT00:00:00")
    },
      option = {
        upsert: false,
      }


    await Orders.updateOne({ _id: req.body.orderId }, { $set: update }, option)
      .then(async (data) => {
        let addOrderLog = new OrderLogs();
        addOrderLog.orderId = orderId;
        addOrderLog.requestType = 'Order Status Updated!';
        addOrderLog.userId = userId;
        addOrderLog.requestParameters = reqParms;
        addOrderLog.magentoOrderId = magentoOrderId;
        await addOrderLog
          .save()
          .then((newlog) => {
            console.log(newlog);
          })
          .catch((err) => {
            console.log(err);
          });
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        res.status(503).json({ err: err });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};


orders.sendMail = async (req, res, next) => {
  let value = 0;
  let mailRepo = {}
  if (req.body) {
    let userId = req.params.id;
    let orderId = req.body.orderId;
    let reqParms = [];
    let mailUrl = '';
    let MagentoOrderId = ''
    await Orders.findOne({ _id: req.body.orderId }).then(async (data) => {
      reqParms[0] = {
        oldStatus: data.status,
        waybillArray: data.waybillArray,
        // shippingCost: data.shippingCost,
        comments: data.comments,
        orderDate: data.orderDate,
        mailReport: data.mailReport
      };
      MagentoOrderId = data.magentoOrderId;
      let mailData = {
        status: data.status,
        magentoOrderId: data.magentoOrderId,
        address: data.address[0],
        storeName: data.storeName,
        orderDate: data.orderDate.toDateString(),
        orderDetails: data.orderDetails,
        orderTotalInclTax: data.orderTotalInclTax.toString(),
        //needs update for waybill Array !!
        waybill: data.waybill,
        discountAmount: data.discountAmount.toString(),
        orderGrandTotal: data.orderGrandTotal.toString(),
        customerEmail: data.customerEmail
      };
      console.log(mailData, 'mailData');
      if (req.body.status === "Manifest-Generated") {
        mailUrl = 'manifest';
      }
      else if (req.body.status === "Shipped") {
        mailUrl = 'shipped';
      }
      else if (req.body.status === "In-Transit") {
        mailUrl = "transit";
      }
      else if (req.body.status === "Out-For-Delivery") {
        mailUrl = 'delivery';
      }
      else if (req.body.status === "Delivered") {
        mailUrl = 'delivered';
      }
      await axios({
        method: 'POST',
        url: `http://3.109.16.169:3000/aws/${mailUrl}`,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        data: mailData,
      }).then((responseData) => {
        console.log(responseData.data, 'response from mailing server api');
        value = 1;
        mailRepo.awsResponseData = [];
        mailRepo.awsResponseData.push(responseData.data);
        reqParms[1] = {
          newStatus: reqParms[0].oldStatus,
          waybill: reqParms[0].waybill,
          // shippingCost: reqParms[0].shippingCost,
          orderDate: reqParms[0].orderDate,
          comments: reqParms[0].comments
        };

        // res.json({ data: responseData.data });
      }).catch((err) =>
        console.log(err, 'error fetching Delivery Status from Mailing Server')
      );

    })
    // let mailRepo = {name: req.body.status, value: value, date: moment().format("YYYY-MM-DDT00:00:00")};
    mailRepo.name = req.body.status;
    mailRepo.value = value;
    mailRepo.date = Date.now()

    const option = {
      upsert: false,
    }
    console.log(mailRepo, 'mailREPO');
    await Orders.updateOne({ _id: req.body.orderId }, { $push: { mailReport: mailRepo } }, option)
      .then(async (data) => {
        reqParms[1].mailReport = data.mailReport;
        let addOrderLog = new OrderLogs();
        addOrderLog.orderId = orderId;
        addOrderLog.requestType = 'Order Mail Report Updated!';
        addOrderLog.userId = userId;
        addOrderLog.magentoOrderId = MagentoOrderId;
        addOrderLog.requestParameters = reqParms;
        await addOrderLog
          .save()
          .then((newlog) => {
            console.log(newlog);
          })
          .catch((err) => {
            console.log(err);
          });
        res.json({ success: 'OK' });
      })
      .catch((err) => {
        res.status(503).json({ err: err });
      });
  }
}


orders.deleteOrder = (req, res, next) => {
  // console.log(req.body);
  const id = req.body.id;
  Orders.deleteOne({ _id: id })
    .then(() => { res.json({ success: 'OK' }) })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};


module.exports = orders;
