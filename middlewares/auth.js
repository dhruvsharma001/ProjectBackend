const jwt = require("jsonwebtoken")
const config = require("config");


module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    //console.log(req.header)
    //console.log(token);
    if (!token) {
        return res.json({ error: "Unauthorized" })
    }

    const decoded = jwt.verify(token, config.get("jwtSecret"))

    try {
        req.role = decoded.user.role
        req.uid = decoded.user.uid

        next();
    }
    catch (err) {
        res.status(401).json({ error: "Unauthorized" })
    }
}


