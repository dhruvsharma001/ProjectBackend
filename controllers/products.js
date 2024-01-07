const mongoose = require('mongoose');
const path = require('path');
const Products = require('../models/Products');
const Logs = require('../models/Logs');

const importProducts = require('../config/init');
const multerfunctions = require('../config/multer');

const products = {};
const logs = {};

products.get = (req, res, next) => {
  Products.find({})
    .sort({ _id: -1 })
    .select({
      name: 1,
      quantity: 1,
      SKU: 1,
      HSN: 1,
      BuyingPrice: 1,
      SellingPrice: 1,
      location: 1,
      productNumber: 1,
      productType: 1,
      Category: 1,
      ReOrder: 1,
      imageUrl: 1,
    })
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};
products.getCount = (req, res, next) => {
  Products.find({}).count()
    .then((data) => {
      if (data) {
        res.json({ data: data });
      } else {
        res.json({ error: 'Empty Set' });
      }
    });
};

products.getDetails = (req, res, next) => {
  if (req.params.uid) {
    Products.aggregate([
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



products.uploadProducts = (req, res) => {
  multerfunctions.uploadProducts_Listing(req, res, (error) => {
    console.log('Request ---', req.body);
    console.log('Request file ---', req.file);

    if (error) {
      if (error.code == 'LIMIT_FILE_SIZE') {
        error.message = 'File Size is too large.';
        error.success = false;
      }
      return res.json(error);
    } else {
      if (!req.file) {
        res.status(500);
        // res.json('file not found');
      }
      // res.status(200);
      importProducts();

      res.json({
        success: true,
        message: 'File uploaded successfully!',
      });
    }
  });
};

products.insertProduct = (req, res, next) => {
  if (req.body) {
    console.log(req.body);
    let record = new Products();
    record.name = req.body.name || '';
    record.productType = req.body.productType || '';
    record.quantity = req.body.quantity || null;
    record.location = req.body.location || '';
    record.productNumber = req.body.productNumber || '';
    record.SKU = req.body.SKU || '';
    record.HSN = req.body.HSN || '';
    record.BuyingPrice = req.body.BuyingPrice || null;
    record.SellingPrice = req.body.SellingPrice || null;
    record.Category = req.body.Category || '';
    record.imageUrl = req.body.imageUrl || '';
    record.ReOrder = req.body.ReOrder || false;

    record
      .save()
      .then((udata) => {
        res.json({ data: udata });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.msg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

products.add = (req, res, next) => {
  if (req.body) {
    console.log(req.body);

    let record = new Products();
    record.name = req.body.name || '';
    record.quantity = req.body.quantity || null;
    record.location = req.body.location || '';
    record.productType = req.body.productType || '';
    record.productNumber = req.body.productNumber || '';
    record.SKU = req.body.SKU || '';
    record.HSN = req.body.HSN || '';
    record.BuyingPrice = req.body.BuyingPrice || null;
    record.SellingPrice = req.body.SellingPrice || null;
    record.Category = req.body.Category || '';
    record.imageUrl = req.body.imageUrl || '';
    record.ReOrder = req.body.ReOrder || false;
    record
      .save()
      .then((udata) => {
        res.json({ success: 'OK' });
        console.log(udata);
        let addLog = new Logs();
        addLog.productId = udata._id;
        addLog.requestType = 'New Product Added !';
        addLog.userId = req.body.userId;
        addLog
          .save()
          .then((newlog) => {
            console.log(newlog);
          })
          .catch((err) => {
            console.log(err);
            res.status(503).json({ err: err.errmsg });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ err: err.errmsg });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

products.updateProduct = async (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);
    let reqParm = [];
    await Products.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
      .select({
        name: 1,
        productType: 1,
        quantity: 1,
        SKU: 1,
        HSN: 1,
        BuyingPrice: 1,
        SellingPrice: 1,
        Category: 1,
        location: 1,
        productNumber: 1,
        imageUrl: 1,
      })
      .then((data) => {
        console.log(data, typeof data);
        reqParm[0] = data;
      })
      .catch((err) => {
        console.log(err);
      });
    const update = {
      name: req.body.name,
      quantity: req.body.quantity,
      location: req.body.location,
      productType: req.body.productType,
      productNumber: req.body.productNumber,
      SKU: req.body.SKU,
      HSN: req.body.HSN,
      BuyingPrice: req.body.BuyingPrice,
      SellingPrice: req.body.SellingPrice,
      Category: req.body.Category,
      imageUrl: req.body.imageUrl,
      ReOrder: req.body.ReOrder,
    },
      options = {
        upsert: false,
      };
    reqParm[1] = update;
    Products.updateOne({ _id: req.params.id }, { $set: update }, options)
      .then((udata) => {
        res.json({ success: 'OK' });
        // console.log(udata, udata_id, 'update response');
        let addLog = new Logs();
        addLog.productId = req.params.id;
        addLog.requestType = 'Product Edited !';
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


products.updateProductInventory = async (req, res, next) => {
  if (req.body) {
    // console.log(req.body);
    // const hash = bcrypt.hashSync(req.body.password, salt);
    let reqParm = [];
    await Products.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
      .select({
        name: 1,
        quantity: 1,
        producType: 1,
        SKU: 1,
        HSN: 1,
        BuyingPrice: 1,
        SellingPrice: 1,
        Category: 1,
        imageUrl: 1,
      })
      .then((data) => {
        console.log(data, typeof data);
        reqParm[0] = data;
      })
      .catch((err) => {
        console.log(err);
      });
    const update = {
      name: reqParm[0].name,
      quantity: req.body.updatedQuantity,
      productType: reqParm[0].productType,
      SKU: reqParm[0].SKU,
      HSN: reqParm[0].HSN,
      BuyingPrice: reqParm[0].BuyingPrice,
      SellingPrice: reqParm[0].SellingPrice,
      Category: reqParm[0].Category,
      imageUrl: reqParm[0].imageUrl
    },
      options = {
        upsert: false,
      };
    reqParm[1] = update;
    Products.updateOne({ _id: req.params.id }, { $set: update }, options)
      .then((udata) => {
        res.json({ success: 'OK' });
        // console.log(udata, udata_id, 'update response');
        let addLog = new Logs();
        addLog.productId = req.params.id;
        addLog.requestType = req.body.remarks;
        addLog.userId = req.body.userId;
        addLog.issue = req.body.ischecked;
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

products.updateImageUrl = (req, res, next) => {
  function removeFiles(image) {
    return new Promise((resolve, reject) => {
      const path = config.get('profile_directory');

      try {
        const f = path + image;
        console.log(f);
        fs.unlinkSync(f);
        resolve(true);
      } catch (err) {
        console.error(err);
        resolve(false);
      }
    });
  }
  if (req.body) {
    const files = req.files;
    let op = [];

    if (!files) {
      const error = new Error('Please choose files');
      error.httpStatusCode = 400;
      return res.send(error);
    }
    files.forEach((e) => {
      op = [...op, e.filename];
    });
    Products.findOne({ _id: req.params.uid })
      .then(async (data) => {
        if (!data) {
          return res.status(422).json({ error: 'Data not Found.' });
        }
        const a = await removeFiles(data.imageUrl);
        data.imageUrl = op[0];
        data
          .save()
          .then((d) => res.json({ success: 'OK' }))
          .catch(next);
      })
      .catch((err) => {
        res.status(503).json({ err: err });
      });
  } else {
    res.status(503).json({ err: 'Not data found.' });
  }
};

products.deleteProduct = async (req, res, next) => {
  var id = req.body.id;
  var reqParm = [];
  var userId = req.body.userId;
  console.log(id, userId, 'id and userid ')
  await Products.findOne({ _id: mongoose.Types.ObjectId(id) })
    .select({
      name: 1,
      quantity: 1,
      productType: 1,
      SKU: 1,
      HSN: 1,
      BuyingPrice: 1,
      SellingPrice: 1,
      Category: 1,
      imageUrl: 1,
      location: 1,
      productNumber: 1
    })
    .then((data) => {
      reqParm[0] = data;
    })
    .catch((err) => {
      console.log(err);
    });
  Products.deleteOne({ _id: id }).then((d) => {
    res.json({ success: 'OK' });
    reqParm[1] = {
      name: 'N/A',
      quantity: 'N/A',
      productType: 'N/A',
      SKU: 'N/A',
      location: 'N/A',
      productNumber: 'N/A',
      HSN: 'N/A',
      BuyingPrice: 'N/A',
      SellingPrice: 'N/A',
      Category: 'N/A',
    }
    let addLog = new Logs();
    addLog.productId = id;
    addLog.requestType = 'Product Deleted !';
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


module.exports = products;
