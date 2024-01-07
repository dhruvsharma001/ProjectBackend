const fs = require('fs');
const parse = require('csv-parse');

const Products = require('../models/Products');

const importProducts = async () => {
  // await Products.deleteMany();
  console.log('hre');
  var csvData = [];
  fs.createReadStream('./uploads/csv/Products_Payload.csv')
    .pipe(parse())
    .on('data', function (csvrow) {
      csvData.push(csvrow);
    })
    .on('end', async function () {
      console.log(csvData.length, 'length of records..');
      for (let i = 1; i < csvData.length; i++) {
       Products.countDocuments({SKU: csvData[i][3]}, async (err, count) => { 
          if(count>0){
            console.log(csvData[i][1], "product " , "with sku",  csvData[i][3], "exists already updating quantity!");
              //document exists });
	var update = {
                quantity: parseInt(csvData[i][2]) 
                };
        const options = {
                upsert: false,
                };
        await Products.updateOne({ SKU: csvData[i][3] }, { $set: update }, options); 
          }
          else {
            console.log(csvData[i], 'row');
          Products.create({
          name: csvData[i][1],
          quantity: parseInt(csvData[i][2]),
          SKU: csvData[i][3],
          HSN: csvData[i][4],
          BuyingPrice: parseInt(csvData[i][5]),
          SellingPrice: parseInt(csvData[i][6]),
          Category: csvData[i][7],
          imageUrl: csvData[i][8] || '',
          productType: csvData[i][9] || 'WH'
        });
          }
      }); 
        
      }
      console.log('Products imported');
    });
};
const init = async () => {
  try {
    await importProducts();
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = init;
