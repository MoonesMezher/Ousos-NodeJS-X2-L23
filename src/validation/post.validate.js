const { body, param } = require("express-validator");
const validation = require("../middlewares/validation");

const addPostValidation = [
    body("content")
        .not().isEmpty().withMessage("Content is required")
        .isString().withMessage("Content must be string")
        .isLength({ max: 20, min: 5 }).withMessage("Content lenght must be between 5 - 20"),

    body("status")
        .not().isEmpty().withMessage("Content is required")
        .isString().withMessage("Status must be string")
        .isIn(["Sad", "Happy", "Funny"]).withMessage('Status must be in ["Sad", "Happy", "Funny"]'),

    // catch errors
    validation
];

module.exports = {
    addPostValidation
}