const address = require("express").Router();
const addressController = require("../controllers/address");
const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");


address.get("/getAll/:uid", addressController.get);
address.post("/add", addressController.add);
address.get("/defaultAddress/:aid", addressController.updateDefault);
address.put("/update/:id", addressController.update);
address.post("/remove", addressController.deleteAddress);


module.exports = address