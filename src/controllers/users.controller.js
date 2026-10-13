const User = require("../models/User");
const hashService = require("../utils/hashService")
const jwtService = require("../utils/jwtService")

class UsersController {
    signup = async (req, res) => {
        const { email, password } = req.body;

        const hashed = await hashService.hash(password);
        await User.create({ email, password: hashed });

        res.status(201).json({ message: "Added" });
    }

    signin = async (req, res) => {
        const { email, password } = req.body;

        const emailIsExist = await User.findOne({ email });

        if(!emailIsExist) {
            return res.status(400).json({ message: "Invalid Data" })
        }

        const passwordIsTrue = await hashService.compare(password, emailIsExist.password);

        if(!passwordIsTrue) {
            return res.status(400).json({ message: "Invalid Data" })
        }

        // key = jwt = token
        const token = jwtService.sign({ email });

        res.status(200).json({ message: "Logged in successfully", token })
    }

    logout = async (req, res) => {
        res.status(200).json({ message: "Logged out successfully"})
    }
}

module.exports = new UsersController();