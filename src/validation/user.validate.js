const { body } = require("express-validator");
const validation = require("../middlewares/validation");
const User = require("../models/User");

const signUpUserValidation = [
    body("email")
        .not().isEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid Email")
        .custom(async (val) => {
            const user = await User.findOne({ email: val });

            if(user) throw new Error("This email is already exist")

            return true;
        }),

    body("password")
        .not().isEmpty().withMessage("Password is required")
        .isStrongPassword().withMessage("Invalid password"),

    validation
]

module.exports = {
    signUpUserValidation
}