const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const asyncHandler = require("../utils/asyncHandler");
const { signUpUserValidation } = require("../validation/user.validate")

router.post("/signup", [...signUpUserValidation], asyncHandler(usersController.signup))

module.exports = router