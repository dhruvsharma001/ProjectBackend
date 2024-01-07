const ip = require("express").Router();
const ipController = require("../controllers/ip");

const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");

ip.get("/getAll", authAdmin, ipController.getAll);
ip.post("/insert", authAdmin, ipController.insert);
ip.post("/update", authAdmin, ipController.update);
ip.post("/remove", authAdmin, ipController.remove)
// ip.post("/statusUpdate", authAdmin, ipController.statusUpdate);

module.exports = ip