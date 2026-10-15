const User = require("../models/User");
const jwtService = require("../utils/jwtService");

const auth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if(!authorization) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const token = authorization.split(" ")[1];

        const verified = jwtService.verify(token); 

        const email = verified.email;

        const user = await User.findOne({ email }).select("-password -__v");

        if(!user) {
            return res.status(404).json({ message: "User Not Found" })
        }

        if(user.block) {
            return res.status(401).json({ message: "User Blocked" })
        }

        req._user = user;

        next();
    } catch(err) {
        return res.status(401).json({ message: "Unauthorized", msg: err.message })
    }
}

module.exports = auth;