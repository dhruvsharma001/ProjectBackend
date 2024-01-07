const mongoose = require('mongoose');

const News = require("../models/News");


const routers = {};

routers.get = (req, res, next) => {
    News.find({}).sort({ _id: -1 }).then(data => {
        if (data) {
            res.json({ data: data });
        }
        else {
            res.json({ error: "Empty Set" });
        }
    })
}

routers.getDetails = (req, res, next) => {
    if (req.params.uid) {
        News.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(req.params.uid) }
            },
        ]).then(data => res.json({ data: data }))
            .catch(next);
    } else {
        res.json({ error: "Empty Set" });
    }
}



routers.add = (req, res, next) => {
    if (req.body) {
        const { title, description, type, start, end, className, ...rest } = req.body;

        let record = new News();
        record.title = title;
        record.description = description || '';
        record.type = req.body.type;
        record.start = start;
        record.end = end;
        record.className = className || 'bg-blue';

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
        const { title, description, type, start, end, className, ...rest } = req.body;

        const update = {
            title,
            description,
            type,
            start,
            end,
            className,
        }, options = {
            upsert: false,
        };
        if (req.body.password) {
            const hash = bcrypt.hashSync(req.body.password, salt);
            update.password = hash;
        }
        News.updateOne({ _id: req.params.id }, { $set: update }, options).then(data => {
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

    News.deleteOne({ _id: id }).then(data => res.json({ success: 'OK' })).catch(err => {
        //console.log(err)
        res.json({ err });
    })
}


module.exports = routers;