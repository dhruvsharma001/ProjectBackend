const leaves = require("express").Router();
const LeaveController = require("../controllers/leave");
// const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");

leaves.post("/getAll", authAdmin({ admin: true, employee: true }), LeaveController.get);
leaves.post("/getEmployeesLeaves", authAdmin({ admin: true, employee: true }), LeaveController.getEmployeesLeaves);

leaves.post("/getAllApproved", authAdmin({ admin: true, employee: true }), LeaveController.getApproved);

leaves.post("/add", authAdmin({ admin: true, employee: true }), LeaveController.add);
leaves.post("/adminAdd", authAdmin({ admin: true, employee: true }), LeaveController.adminAdd);
leaves.post("/remove", authAdmin({ admin: true, employee: true }), LeaveController.remove);

leaves.put("/update/:id", authAdmin({ admin: true, employee: true }), LeaveController.update);
leaves.put("/approve/:id", authAdmin({ admin: true, employee: false }), LeaveController.approve);
// leaves.post("/getAllLeaves", authAdmin({admin: true, employee: false}), LeaveController.getAllLeaves);
// leaves.put("/approve/:id", authAdmin({ admin: true, employee: true }), LeaveController.updateReason);

module.exports = leaves