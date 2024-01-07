const mongoose = require('mongoose'),
    moment = require('moment');
const Leaves = require("../models/Leaves");
// const shortLeaves = require("../model/shortLeaves");

const routers = {};

routers.get = (req, res, next) => {
    let queryDate = moment();
    if (req.body.selected_date) {
        queryDate = moment(req.body.selected_date);

    }
    let query = {
        createdAt: {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        }
    };
    if (req.body.user) {
        query.user = req.body.user;
    }
    if (req.body.status) {
        query.status = req.body.status;
    }


    Leaves.find(query).populate('user', 'name _id').sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}
// routers.getAllLeaves = (req, res, next) => {
//     let queryStartDate = moment();
//     let queryEndDate = moment();
//     if(req.body.selectedStart_date) {
//         queryStartDate = moment(req.body.selectedStart_date);
//     }
//     if(req.body.selectedEnd_date){
//         queryEndDate = momemnt(req.body.selectedEnd_date);
//     }
//     let query = {
//         $or: [
//             {
//                 start: {
//                     $gte: new Date(queryStartDate.format('YYYY-MM-DDT00:00:00')),
//                     $lte: new Date(queryEndDate.format('YYYY-MM-DDT23:59:59')),
//                 }
//             }, {
//                 end: {
//                     $gte: new Date(queryStartDate.format('YYYY-MM-DDT00:00:00')),

//                     $lte: new Date(queryEndDate.format('YYYY-MM-DDT00:00:00')),

//                 }
//             }]

//     }
//     if (req.body.user) {
//         query.user = req.body.user;
//     }
// }

routers.getEmployeesLeaves = (req, res, next) => {
    let queryStartDate = moment();
    let queryEndDate = moment();
    if (req.body.selectedStart_date) {
        queryStartDate = moment(req.body.selectedStart_date);
        console.log(req.body.selectedStart_date, 'startdate************')


    }
    if (req.body.selectedEnd_date) {
        queryEndDate = moment(req.body.selectedEnd_date);
        console.log(req.body.selectedEnd_date, 'enddate************')
    }
    let query = {
        $or: [
            {
                start: {
                    $gte: new Date(queryStartDate.format('YYYY-MM-DDT00:00:00')),
                    $lte: new Date(queryEndDate.format('YYYY-MM-DDT23:59:59')),
                }
            }, {
                end: {
                    $gte: new Date(queryStartDate.format('YYYY-MM-DDT00:00:00')),
                    $lte: new Date(queryEndDate.format('YYYY-MM-DDT00:00:00')),

                }
            }]
    };
    if (req.body.user) {
        query.user = req.body.user;
    }
    if (req.body.status) {
        query.status = req.body.status;
    }


    Leaves.find(query).populate('user', 'name _id').sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}








routers.getApproved = (req, res, next) => {
    // let queryDate = moment();
    // if (req.body.selected_date) {
    //     queryDate = moment(req.body.selected_date);

    // }
    let query = {
        status: 'Approved',
        /*  createdAt: {
             $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
             $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
         } */
    };
    if (req.body.user) {
        query.user = req.body.user;
    }

    Leaves.find(query).populate('user', 'name _id').sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}

routers.getDetails = (req, res, next) => {
    if (req.params.id) {
        Leaves.findOne({ _id: req.params.id }).populate('user')
            .then(data => res.json({ data: data }))
            .catch(next);
    } else {
        res.json({ error: "Empty Set" });
    }
}



routers.add = async (req, res, next) => {
    function getDiff(start, end) {
        const a = new Date(start);
        const b = new Date(end);
        return parseInt(((b.getTime() - a.getTime()) / (1000 * 3600 * 24)) + 1);
    }
    if (req.body) {
        console.log(req.body);
        const { user, start, end, reason, category, className, ...rest } = req.body;

        let record = new Leaves();
        record.user = user;
        record.category = category;
        record.className = className;
        record.start = start;
        record.end = end;
        record.total_days = await getDiff(start, end);
        record.reason = reason;

        record.save().then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            console.log(err)
            res.status(503).json({ err: err.errmsg });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}
routers.adminAdd = async (req, res, next) => {
    function getDiff(start, end) {
        const a = new Date(start);
        const b = new Date(end);
        return parseInt(((b.getTime() - a.getTime()) / (1000 * 3600 * 24)) + 1);
    }
    if (req.body) {
        console.log(req.body);
        const { user, start, end, reason, category, className, status, ...rest } = req.body;

        let record = new Leaves();
        record.user = user;
        record.category = category;
        record.className = className;
        record.start = start;
        record.end = end;
        record.total_days = await getDiff(start, end);

        record.status = status;
        record.reason = reason;

        record.save().then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            console.log(err)
            res.status(503).json({ err: err.errmsg });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


routers.update = (req, res, next) => {
    if (req.body) {
        const update = {
            start: req.body.start,
            end: req.body.end,
            reason: req.body.reason,
            category: req.body.category,
            className: req.body.className
        }, options = {
            upsert: false,
        };

        Leaves.updateOne({ _id: req.params.id }, { $set: update }, options).then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}
routers.approve = (req, res, next) => {
    if (req.body) {
        const update = {
            status: 'Approved',
        }, options = {
            upsert: false,
        };

        Leaves.updateOne({ _id: req.params.id }, { $set: update }, options).then(data => {
            res.json({ success: 'OK' });
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}


routers.remove = (req, res, next) => {
    // console.log(req.body);
    const id = req.body.id;
    if (id) {
        Leaves.deleteOne({ _id: id }).then(data => res.json({ success: 'OK' })).catch(err => {
            console.log(err)
            res.send(err);
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }
}

module.exports = routers;