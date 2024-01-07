const userHistory = require("express").Router();
const UserHistoryController = require("../controllers/userHistory");
// const auth = require("../middlewares/auth")
const authAdmin = require("../middlewares/authAdmin");


// UserHistory.get("/getCount", authAdmin({ admin: true, employee: false }), UserHistoryController.getCount);
// UserHistory.get("/getCount/:uid", authAdmin({ admin: true, employee: true }), UserHistoryController.getCount);
userHistory.post("/getAll", authAdmin({ admin: true, employee: true }), UserHistoryController.get);
// UserHistory.get("/today/:uid", authAdmin({ admin: true, employee: true }), UserHistoryController.today);

userHistory.post("/remove", authAdmin({ admin: true, employee: false }), UserHistoryController.deleteUserHistory);
userHistory.get("/check/:id", authAdmin({ admin: true, employee: true }), UserHistoryController.checkBreaks);
userHistory.put("/reason", authAdmin({ admin: true, employee: true }), UserHistoryController.updateReason);

userHistory.post("/login", authAdmin({ admin: true, employee: false }), UserHistoryController.login);
userHistory.post("/logout", authAdmin({ admin: true, employee: false }), UserHistoryController.logout);


userHistory.post("/mail", UserHistoryController.sendMail);
userHistory.get("/mail2", UserHistoryController.sendMail2);


module.exports = userHistory