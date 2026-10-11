require("dotenv").config();
const jwt = require("jsonwebtoken");

class JWTService {
    // paylod = { email, id } => encrytpion
    sign = (paylod) => {
        return jwt.sign(paylod, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })
    }

    // encrytpion => paylod 
    verify = (token) => {
        return jwt.verify(token, process.env.JWT_SECRET_KEY)
    }
}

module.exports = new JWTService();