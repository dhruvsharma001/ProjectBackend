const jwt = require('jsonwebtoken');
const config = require('config');
const Users = require('../models/Users');
const Orders = require('../models/Orders');
const deliveryToken = '';
const moment = require('moment-timezone');
const axios = require('axios')
const OrderLogs = require('../models/OrderLogs');


module.exports = async function delhiveryCron() {
  let endDate = moment();
  let startDate = moment().subtract(14, 'days');
  query1 = { orderDate: { $gte: new Date(startDate.format("YYYY-MM-DDT00:00:00")), $lte: new Date(endDate.format("YYYY-MM-DDT23:59:59")) }, status: { '$ne': 'Delivered' } };
  query2 = { "waybillArray.status": { '$ne': 'Delivered' } };
  console.log(startDate, endDate, query1, query2, 'dates and query for orders');
  await Orders.aggregate([
    { $match: query1 },
    { $unwind: "$waybillArray" },
    { $match: query2 },
    { "$sort": { "magentoOrderId": -1 } },
  ]).then(async (data) => {
    // console.log(data,'data');
    await data.map(async (item, key) => {
      // console.log(item.waybillArray.waybill, item.status, item.magentoOrderId, 'orderno ', key);
      // console.log(item.waybill, 'waybill');
      let waybill = item.waybillArray.waybill;
      let reqParms = [];
      let mailRepo = {};
      let mailUrl = '';
      reqParms[0] = {
        oldStatus: item.waybillArray.status,
        waybillArray: [item.waybillArray],
        // shippingCost: data.shippingCost,
        comments: item.comments,
        orderDate: item.orderDate,
        mailReport: item.mailReport
      };
      console.log(item.magentoOrderId, waybill, 'working on ');
      await axios({
        method: 'GET',
        url: `https://track.delhivery.com/api/v1/packages/json/?token=${deliveryToken}&waybill=${waybill}`,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }).then(async (responseData) => {
        const newDeliveryStatus = responseData.data.ShipmentData[0].Shipment.Status.Status;
        console.log(item.magentoOrderId, waybill, " ---> ", newDeliveryStatus, 'response from delhivery api');
        if (newDeliveryStatus === item.waybillArray.status) {
          console.log(item.magentoOrderId, waybill, " ---> ", 'no change in status.');
        }
        else if (newDeliveryStatus !== item.waybillArray.status && (newDeliveryStatus === 'Manifested' || newDeliveryStatus === 'In Transit' || newDeliveryStatus === 'Dispatched' || newDeliveryStatus === 'Delivered')) {
          let mailData = {
            status: newDeliveryStatus,
            magentoOrderId: item.magentoOrderId,
            address: item.address[0],
            storeName: item.storeName,
            orderDate: item.orderDate.toDateString(),
            orderDetails: item.orderDetails,
            orderTotalInclTax: item.orderTotalInclTax.toString(),
            waybill: item.waybillArray.waybill,
            discountAmount: item.discountAmount.toString(),
            orderGrandTotal: item.orderGrandTotal.toString(),
            customerEmail: item.customerEmail
          };
          if (newDeliveryStatus === "Manifested") {
            mailUrl = 'manifest';
          }
          else if (newDeliveryStatus === "In Transit") {
            mailUrl = "transit";
          }
          else if (newDeliveryStatus === "Dispatched") {
            mailUrl = 'delivery';
          }
          else if (newDeliveryStatus === "Delivered") {
            mailUrl = 'delivered';
          }
          console.log(mailData.magentoOrderId, mailData.status, mailData.waybill, mailUrl, 'mail data to be sent to our mailing server');
          await axios({
            method: 'POST',
            url: `${mailUrl}`,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            data: mailData,
          }).then(async (responseData) => {
            // console.log(responseData.data,  'response from mailing server api');
            value = 1;
            mailRepo.awsResponseData = [];
            mailRepo.awsResponseData.push(responseData.data);
            mailRepo.name = newDeliveryStatus;
            mailRepo.value = value;
            mailRepo.date = Date.now();
            reqParms[1] = {
              newStatus: newDeliveryStatus,
              waybillArray: [{ waybill: item.waybillArray.waybill, status: newDeliveryStatus }],
              // shippingCost: reqParms[0].shippingCost,
              orderDate: item.orderDate,
              comments: item.comments
            };
            const option = {
              upsert: false,
            }
            let update = {
              // $set: {'status': newDeliveryStatus},
              $set: { 'waybillArray.$.status': newDeliveryStatus },
              $push: { mailReport: mailRepo }
            }
            // console.log(mailRepo, 'mailREPO ');
            await Orders.updateOne({ _id: item._id, "waybillArray.waybill": item.waybillArray.waybill }, update, option)
              .then(async (data) => {
                reqParms[1].mailReport = data.mailReport;
                let addOrderLog = new OrderLogs();
                addOrderLog.orderId = item._id;
                addOrderLog.requestType = 'Automated Order Mail Report Updated!';
                addOrderLog.userId = "6144635c5486697edaa64ee5";
                addOrderLog.magentoOrderId = item.magentoOrderId;
                addOrderLog.requestParameters = reqParms;
                // console.log(addOrderLog, 'orderLog');
                await addOrderLog.save().then((newlog) => {
                  console.log(newlog);
                })
                  .catch((err) => {
                    console.log(err);
                  });
                // res.json({ success: 'OK' });
              })
              .catch((err) => {
                console.log(err, 'error updating order');
              });
            // reqParms[1] = {
            //   newStatus: reqParms[0].oldStatus,
            //   waybill: reqParms[0].waybill,
            //   // shippingCost: reqParms[0].shippingCost,
            //   orderDate: reqParms[0].orderDate,
            //   comments: reqParms[0].comments 
            //   };

            // res.json({ data: responseData.data });
          }).catch((err) =>
            console.log(err, 'error fetching Delivery Status from Mailing Server')
          );
        }
      }).catch((err) =>
        console.log(err, 'error fetching Delivery Status from API')
      );
    })
  })
};



