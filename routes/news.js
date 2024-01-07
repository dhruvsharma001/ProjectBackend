const news = require("express").Router();
const NewsController = require("../controllers/news");
// const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");

news.post("/getAll", authAdmin({ admin: true, employee: true }), NewsController.get);

news.post("/add", authAdmin({ admin: true, employee: false }), NewsController.add);
news.post("/remove", authAdmin({ admin: true, employee: false }), NewsController.remove);

// news.put("/update/:id", authAdmin({ admin: true, employee: true }), NewsController.update);
// news.put("/approve/:id", authAdmin({ admin: true, employee: true }), NewsController.updateReason);

module.exports = news