const mongoose = require('mongoose');
const userInventoryUpdate = require('../models/UserInventoryUpdate');
const moment = require('moment');


const routers = {};
routers.add = (req, res, next ) => {
    if (req.body) {
        let record = new userInventoryUpdate();
        record.userId = req.body.userId;
        record.productId = req.body.productId;
        record.check = req.body.check;
        record.issue = req.body.issue || '';
        record.updateTime = new Date();
        record.remarks = req.body.remarks;
        record.quantity = req.body.quantity;

        record.save().then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            console.log(err)
            res.status(503).json({ success: 'NOK' });
        });
    } else {
        res.status(503).json({ err: 'Failed to add data!' });
    }
}
routers.get = (req, res, next) => {
    // const queryDate = moment();
    const query = {};
    let limit = 20;
    let page = 1;
    if (req.params.uid) {
        query.user = mongoose.Types.ObjectId(req.params.uid);
    }
    if (req.query.page) {
        page = parseInt(req.query.page, 10);
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit, 10);
    }
    userInventoryUpdate.find(query)
        .skip(limit * (page - 1))
        .limit(limit).sort({ _id: -1 }).populate('user').sort({ _id: -1 }).then(data => {
            if (data) {
                res.json({ data: data });
            }
            else {
                res.json({ error: 'Empty Set' });
            }
        })
}

routers.today = (req, res, next) => {
    const queryDate = moment();
    const query = {
        break_start: {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        }
    };
    if (req.params.uid) {
        query.user = mongoose.Types.ObjectId(req.params.uid);
    }
    userInventoryUpdate.find(query).sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: 'Empty Set' });
        }
    })
}
routers.startEnd = async (req, res, next) => {
    function getDiff(start, end) {
        const a = new Date(start);
        const b = new Date(end);
        return parseInt((b.getTime() - a.getTime()) / 1000);
    }
    if (req.body) {
        let record = new userInventoryUpdate();
        record.user = req.body.user;
        record.break_start = req.body.break_start;
        record.break_end = req.body.break_end;
        record.total_time = await getDiff(record.break_start, record.break_end);
        record.status = 'End';
        record.save().then(d =>
            res.json({ success: 'OK' })).catch(next);
    }
}

routers.start = async (req, res, next) => {

    // console.log(req.body);
    if (req.body) {
        let record = new userInventoryUpdate();
        record.user = req.body.user;
        record.break_start = new Date();
        record.total_time = 0;

        record.save().then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            console.log(err)
            res.status(503).json({ success: 'NOK' });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


routers.end = (req, res, next) => {
    function getDiff(start) {
        const a = new Date(start);
        return parseInt((Date.now() - a.getTime()) / 1000);
    }
    if (req.body) {
        userInventoryUpdate.find({ user: req.body.user, status: 'Active' }).then(async records => {
            if (!records) {
                return res.json({ success: 'NOK' });
            }
            await records.map(async (record, index) => {
                record.break_end = new Date();
                record.total_time = await getDiff(record.break_start);
                record.status = 'End';

                record.save().then(data => console.log(data, 'breaks updated.'))
                    .catch(err => console.log(err));
            });
            return res.json({ success: 'OK' });
        }).catch(err => {
            console.log(err);
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


routers.deleteuserInventoryUpdate = (req, res, next) => {
    console.log(req.body.id)
    const id = req.body.id;
    if (id) {
        userInventoryUpdate.deleteOne({ _id: id })
            .then(data => res.json({ success: 'OK' })).catch(err => {
                console.log(err)
                res.json({ success: 'NOK' });
            });
    } else {
        res.json({ success: 'NOK' });
    }
}

routers.checkBreaks = (req, res, next) => {
    const queryDate = moment();
    if (req.params.id) {
        userInventoryUpdate.aggregate([{
            $match: {
                user: mongoose.Types.ObjectId(req.params.id),
                break_start: {
                    $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
                    $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
                }
            }
        },
        {
            $group: {
                _id: '$user',
                count: { $sum: 1 },
                total_time: { $sum: '$total_time' }
            }
        }
        ]).then(data => {
            res.json({ data: data });
        }).catch(err => console.log(err));
    } else {
        res.json({ error: 'No data found.' });
    }
}
routers.eod = (req, res, next) => {
    let queryDate = moment();
    if (req.body.selected_date) {
        queryDate = moment(req.body.selected_date);
    }

    let query = {
        break_start: {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        }
    };
    if (req.body.uid) {
        query.user = mongoose.Types.ObjectId(req.body.uid);
    }
    userInventoryUpdate.aggregate([{
        $match: query
    }, {
        $group: {
            _id: '$user',
            count: { $sum: 1 },
            total_time: { $sum: '$total_time' }
        }
    }, {
        $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userdata'
        }
    }, {
        $project: {
            'count': 1,
            'total_time': 1,
            'user': { $arrayElemAt: ['$userdata.name', 0] }
        }
    }]).then(data => {
        res.json({ data: data });
    }).catch(err => console.log(err));

}




routers.editStartBreak = (req, res, next) => {
    if (req.body.id) {

        const selected_time = new Date(req.body.selected_time);

        const query = {
            _id: req.body.id,
        };
        userInventoryUpdate.findOne(query).then(data => {
            if (data) {
                data.break_start = selected_time;
                data.status = 'Active';
                data.save().then(d => {
                    return res.json({ success: 'OK' });
                }).catch(next);
            }
            else {
                let record = new userInventoryUpdate();
                record.user = user;
                record.break_start = selected_time;
                record.status = 'Active';
                record.save().then(data => {
                    return res.json({ success: 'OK' });
                }).catch(next);
            }
        }).catch(next);
    } else {
        return res.status(422).json({ error: 'No data found.' });
    }
}

routers.editEndBreak = (req, res, next) => {
    function getDiff(start) {
        const a = new Date(start);
        const b = new Date(req.body.selected_time);
        return ((b.getTime() - a.getTime()) / (1000)).toFixed(2);
    }
    if (req.body.id) {
        const selected_time = new Date(req.body.selected_time);

        const query = {
            _id: req.body.id
        };
        userInventoryUpdate.findOne(query).then(async record => {
            if (!record) {
                return res.json({ success: 'NOK' });
            }
            record.break_end = selected_time;
            record.total_time = await getDiff(record.break_start);
            record.status = 'End';
            console.log(record.total_time, '^^^^^^^^^^^^^^^^^^^^^^^^^')

            record.save().then(data => res.json({ success: 'OK' }))
                .catch(err => console.log(err));
        }).catch(err => {
            console.log(err);
            res.status(503).json({ err: err });
        });
    } else {
        return res.status(422).json({ error: 'No data found.' });
    }
}

module.exports = routers