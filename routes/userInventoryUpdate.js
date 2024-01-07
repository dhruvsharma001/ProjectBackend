const userInventoryUpdate = require("express").Router();
const userInventoryUpdateController = require("../controllers/userInventoryUpdate");
// const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");


// userInventoryUpdate.get("/getAll", authAdmin({ admin: true, employee: true }), userInventoryUpdateController.get);
// userInventoryUpdate.get("/getAll/:uid", authAdmin({ admin: true, employee: true }), userInventoryUpdateController.get);
// userInventoryUpdate.get("/today/:uid", authAdmin({ admin: true, employee: true }), userInventoryUpdateController.today);
userInventoryUpdate.post("/add", authAdmin({ admin: true, employee: true }), userInventoryUpdateController.add);


module.exports = userInventoryUpdate