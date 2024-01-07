const config = require("config");
const Users = require("../models/Users");
const Ip = require("../models/Ip");



const ip = {}


ip.getAll = (req, res, next) => {
    Ip.find().then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}

ip.insert = (req, res, next) => {
    if (req.body) {
        let entry = new Ip();
        entry.ip = req.body.ip;
        entry.save().then(data => {
            res.json({ data: data });
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }

}

ip.update = (req, res, next) => {
    if (req.body) {
        const update = {
            ip: req.body.ip,
            status: req.body.status
        }, options = {
            upsert: false,
        };
        Ip.updateOne(req.params.id, { $set: update }, options).then(data => {
            res.json({ data: data });
        }).catch(err => {
            res.status(503).json({ err: err });
        });
    } else {
        res.status(503).json({ err: 'Not data found.' });
    }

}

ip.remove = (req, res, next) => {
    const id = req.body._id;

    Ip.deleteOne({ _id: id }).then(
        data => res.send(data)
    ).catch(err => {
        console.log(err)
        res.send(err);
    })

}


module.exports = ip