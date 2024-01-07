const mongoose = require('mongoose');
const UserHistory = require("../models/UserHistories");
const

    // moment = require('moment'),
    moment = require('moment'),
    momentTz = require('moment'),
    nodeMailer = require('nodemailer'),
    { parse } = require('json2csv'),
    hbs = require('nodemailer-express-handlebars'),
    path = require('path'),
    fs = require('fs');


const routers = {};

routers.get = (req, res, next) => {
    let queryDate = moment();
    const query = {
        logged_in: {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        }
    };

    // let limit = 20;
    // let page = 1;
    if (req.body.uid) {
        query.user = mongoose.Types.ObjectId(req.body.uid);
    }
    // if (req.query.page) {
    //     page = parseInt(req.query.page, 10);
    // }
    // if (req.query.limit) {
    //     limit = parseInt(req.query.limit, 10);
    // }
    if (req.body.selected_date) {
        queryDate = moment(req.body.selected_date);
        query.logged_in = {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        };
    }
    UserHistory.find(query)
        // .skip(limit * (page - 1))
        // .limit(limit)
        .populate('user').sort({ _id: -1 }).then(data => {
            if (data) {
                res.json({ data: data });
            }
            else {
                res.json({ error: "Empty Set" });
            }
        });
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
    UserHistory.find(query).sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    });
}

routers.deleteUserHistory = (req, res, next) => {
    // console.log(req.body._id)
    const id = req.body.id;
    if (id) {
        UserHistory.deleteOne({ _id: id })
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
        UserHistory.aggregate([{
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
                _id: 'user',
                count: { $sum: 1 },
                total_time: { $sum: "$total_time" }
            }
        }]).then(data => {
            res.json({ data: data });
        }).catch(err => console.log(err));
    } else {
        res.json({ error: 'No data found.' });
    }
}

routers.updateReason = (req, res, next) => {

    if (req.body.id) {
        UserHistory.findOne({ _id: req.body.id }).then(data => {
            if (!data) {
                return res.status(422).json({ error: 'No data found.' });
            }
            data.reason = req.body.reason;
            data.save().then(d => res.json({ success: 'OK' })).catch(next);
        }).catch(err => console.log(err));
    } else {
        return res.status(422).json({ error: 'No data found.' });
    }
}

routers.login = (req, res, next) => {
    if (req.body.id) {

        const selected_time = new Date(req.body.selected_time);

        const query = {
            _id: req.body.id,
        };
        UserHistory.findOne(query).then(data => {
            if (data) {
                data.logged_in = selected_time;
                data.status = 'loggedin';
                data.save().then(d => {
                    return res.json({ success: 'OK' });
                }).catch(next);
            } else {
                let record = new UserHistory();
                record.user = user;
                record.logged_in = selected_time;
                record.status = 'loggedin';
                record.save().then(data => {
                    return res.json({ success: 'OK' });
                }).catch(next);
            }
        }).catch(next);
    } else {
        return res.status(422).json({ error: 'No data found.' });
    }
}

routers.logout = (req, res, next) => {
    function getDiff(start) {
        const a = new Date(start);
        const b = new Date(req.body.selected_time);
        return ((b.getTime() - a.getTime()) / (1000 * 60 * 60)).toFixed(2);
    }
    if (req.body.id) {
        const selected_time = new Date(req.body.selected_time);

        const query = {
            _id: req.body.id
        };
        UserHistory.findOne(query).then(async record => {
            if (!record) {
                return res.json({ success: 'NOK' });
            }
            record.logged_out = selected_time;
            record.total_time = await getDiff(record.logged_in);
            record.status = 'loggedout';

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
routers.sendMail = (req, res, next) => {
    const TimeZone = 'Asia/Kolkata';
    function generateCsv(docs) {
        return new Promise(async (resolve, reject) => {
            /* const dateTime = new Date().toISOString().slice(-24).replace(/\D/g,
                '').slice(0, 14); */
            const filePath = path.join(__dirname, "../templates/", "attendance.csv");

            const fields = ['name', 'logged_in', 'logged_out', 'status', 'total_time', 'reason'];
            const opts = { fields };

            // const fieldNames = ['Name', 'Logged In', 'Logged Out', 'Total Time', 'Status', 'Reason'];
            // const csv = json2csv({ data: docs, fields: fields, fieldNames: fieldNames });
            const csv = parse(docs, opts);

            return fs.writeFileSync(filePath, csv, { flag: 'w+' }, (err) => {
                if (err) return reject(err);
                //   resolve(true);
                resolve(filePath);

            });
        });
    }

    let queryDate = moment();
    const query = {
        logged_in: {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        }
    };

    if (req.body.selected_date) {
        queryDate = moment(req.body.selected_date);
        query.logged_in = {
            $gte: new Date(queryDate.format('YYYY-MM-DDT00:00:00')),
            $lte: new Date(queryDate.format('YYYY-MM-DDT23:59:59')),
        };
    }
    UserHistory.aggregate([
        { $match: { logged_in: { '$gte': new Date("Thu, 30 Jan 2020 00:00:00 GMT"), '$lte': new Date("Thu, 30 Jan 2020 23:59:59 GMT") } } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userdata' } },
        { $sort: { _id: -1 } },
        {
            $project: {
                user: 1,
                logged_in: { $dateToString: { date: "$logged_in", timezone: TimeZone } },
                logged_out: { $dateToString: { date: "$logged_out", timezone: TimeZone } },
                total_time: 1,
                status: 1,
                reason: 1,
                name: { $arrayElemAt: ["$userdata.name", 0] }
            }
        },
    ])
        .then(data => {
            if (data) {

                generateCsv(data)
                    .then(d => console.log(d))
                    .catch(err => {
                        console.log(err, 'test errror');
                    });
                res.json({ success: 'OK' });
            } else {
                res.json({ error: "Empty Set" });
            }
        }).catch(err => console.log(err));
}

routers.sendMail2 = (req, res, next) => {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            // should be replaced with real sender's account
            // type: 'LOGIN',
            user: '',
            pass: ''
        },
        logger: true,
        debug: false,
    });
    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.html',
            partialsDir: 'templates',
            layoutsDir: 'templates',
            defaultLayout: 'email.html',
        },
        viewPath: 'templates',
        extName: '.html'
    }));
    function adminEmail() {
        return new Promise((resolve, reject) => {
            let mailOptions = {
                // should be replaced with real recipient's account
                from: '',
                to: '',
                bcc: '',
                subject: '',
                template: 'email',
                context: {
                    user: 'admin',
                    link: '',
                },
                attachments: [
                    { // use URL as an attachment
                        filename: 'attendance.csv',
                        path: 'templates/attendance.csv'
                    }
                ]
            };
            return transporter.sendMail(mailOptions).then((info) => {
                console.log(info, 'response from email');

                resolve(true);
            }).catch(err => console.log(err))


        });
    }

    adminEmail().then(d => {
        if (d) {
            res.json({ success: 'OK' });
        } else {
            res.json({ success: 'NOK' });
        }
    });
}

module.exports = routers