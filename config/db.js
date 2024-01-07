const mongoose = require("mongoose")
const config = require("config");

const uri = config.get("mongoURI")
// main function to connect the file
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(

    () => { console.log("db connected Works!") },

    err => { console.log(err,"error") }

);
//mongoose.set('useCreateIndex', true);
mongoose.set('debug', true);

module.exports = mongoose
