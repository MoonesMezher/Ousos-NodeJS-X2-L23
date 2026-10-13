const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const asyncHandler = require("../utils/asyncHandler");
const { signUpUserValidation, signInUserValidation } = require("../validation/user.validate");
const auth = require("../middlewares/auth");

router.post("/signup", [...signUpUserValidation], asyncHandler(usersController.signup))

router.post("/signin", [...signInUserValidation], asyncHandler(usersController.signin))

router.post("/logout", [auth], asyncHandler(usersController.logout))

module.exports = router