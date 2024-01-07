const mongoose = require('mongoose');
const Address = require("../models/Addresses");

const address = {};

address.get = (req, res, next) => {
    Address.find({ user: mongoose.Types.ObjectId(req.params.uid) }).sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}

address.add = async (req, res, next) => {
    console.log(req.body, "request params")
    function updateDefaultAll(user) {
        const update = {
            defaultAddress: 'no',
        }, options = {
            upsert: false
        };

        return new Promise((resolve, reject) => {
            Address.updateMany({ user: user }, { $set: update }, options).then(data => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    let success = 'NOK';

    // console.log(req.body);
    if (req.body) {
        let record = new Address();
        record.user = req.body.uid;
        record.email = req.body.email;
        record.name = req.body.name;
        record.mobile = req.body.mobile;
        record.address = req.body.address;
        record.locality = req.body.locality || '';
        record.state = req.body.state || '';
        record.district = req.body.district || '';
        record.pincode = req.body.pincode || '';
        record.defaultAddress = req.body.defaultAddress || 'no';
        if (record.defaultAddress == 'yes') {
            const r = await updateDefaultAll(req.body.uid);
            console.log(r, 'insert address')
        }
        if (req.body.location) {
            //{ type: 'Point', coordinates: [-104.9903, 39.7392] }
            const l = req.body.location;
            record.location = { type: l.type, coordinates: l.coordinates };
        }

        record.save().then(data => {
            success = 'OK';
            res.json({ success: success });
        }).catch(err => {
            console.log(err)
            res.status(503).json({ success: success });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


address.update = (req, res, next) => {
    function updateDefaultAll(user) {
        const update = {
            defaultAddress: 'no',
        }, options = {
            upsert: false
        };

        return new Promise((resolve, reject) => {
            Address.updateMany({ user: user }, { $set: update }, options).then(data => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    if (req.body) {
        Address.findOne({ _id: req.params.id }).then(async record => {
            if (req.body.defaultAddress == 'yes') {
                const r = await updateDefaultAll(record.user);
            }
            record.user = req.body.uid;
            record.email = req.body.email;
            record.name = req.body.name;
            record.mobile = req.body.mobile;
            record.address = req.body.address;
            record.locality = req.body.locality || '';
            record.state = req.body.state || '';
            record.district = req.body.district || '';
            record.pincode = req.body.pincode || '';
            record.defaultAddress = req.body.defaultAddress || 'no';
            record.save().then(data => res.json({ success: 'OK' }))
                .catch(err => console.log(err));
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}
/* default address part is pending update all address */
address.updateDefault = (req, res, next) => {
    function updateDefaultAll(user) {
        const update = {
            defaultAddress: 'no',
        }, options = {
            upsert: false
        };

        return new Promise((resolve, reject) => {
            Address.updateMany({ user: user }, { $set: update }, options).then(data => {
                console.log(data);
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    if (req.body) {
        Address.findOne({ _id: req.params.aid }).then(uaddress => {
            if (updateDefaultAll(uaddress.user)) {
                uaddress.defaultAddress = 'yes';
                uaddress.save().then(data => res.json({ data: data })).catch(next);
            }
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


address.deleteAddress = (req, res, next) => {
    console.log(req.body._id)
    const id = req.body.id;
    if (id) {
        Address.deleteOne({ _id: id })
            .then(data => res.json({ success: 'OK' })).catch(err => {
                console.log(err)
                res.json({ success: 'NOK' });
            });
    } else {
        res.json({ success: 'NOK' });
    }
}


module.exports = address