const jwtService = require("../utils/jwtService");

const auth = (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if(!authorization) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const token = authorization.split(" ")[1];

        const verified = jwtService.verify(token); 

        next();
    } catch(err) {
        return res.status(401).json({ message: "Unauthorized", msg: err.message })
    }
}

module.exports = auth;