const User = require("../models/User");
const hashService = require("../utils/hashService")

class UsersController {
    signup = async (req, res) => {
        const { email, password } = req.body;

        const hashed = await hashService.hash(password);
        await User.create({ email, password: hashed });

        res.status(201).json({ message: "Added" });
    }
}

module.exports = new UsersController();