const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const asyncHandler = require("../utils/asyncHandler");
const { signUpUserValidation, signInUserValidation } = require("../validation/user.validate");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const id = require("../middlewares/id");
const { loginLimiter } = require("../middlewares/limiter");

router.get("/pagination", asyncHandler(usersController.pagination));
router.get("/stats", [auth, role(["admin"])], asyncHandler(usersController.stats));

// GET /api/v1/users  =>  all users (admin only)
router.get("/", [auth, role(["admin"])], asyncHandler(usersController.getAll));

// GET /api/v1/users/profile  =>  own profile (must be before /:id)
router.get("/profile", [auth, role(["admin", "user"])], asyncHandler(usersController.profile));

// PATCH /api/v1/users/profile  =>  update own profile (must be before /:id)
router.patch("/profile", [auth, role(["admin", "user"])], asyncHandler(usersController.updateProfile));

// GET /api/v1/users/blocked  =>  all blocked users (must be before /:id)
router.get("/blocked", [auth, role(["admin"])], asyncHandler(usersController.getBlocked));

// GET /api/v1/users/search?email=  =>  search users by email (must be before /:id)
router.get("/search", [auth, role(["admin"])], asyncHandler(usersController.search));

// PATCH /api/v1/users/change-password  =>  change own password (must be before /:id)
router.patch("/change-password", [auth, role(["admin", "user"])], asyncHandler(usersController.changePassword));

// GET /api/v1/users/:id  =>  single user by id (admin only)
router.get("/:id", [...id, auth, role(["admin"])], asyncHandler(usersController.getById));

// POST /api/v1/users/signup
router.post("/signup", [...signUpUserValidation], asyncHandler(usersController.signup));

// POST /api/v1/users/signin
router.post("/signin", [loginLimiter, ...signInUserValidation], asyncHandler(usersController.signin));

// POST /api/v1/users/logout
router.post("/logout", [auth], asyncHandler(usersController.logout));

// PUT /api/v1/users/block/:id  =>  block a user (admin only)
router.put("/block/:id", [...id, auth, role(["admin"])], asyncHandler(usersController.block));

// PATCH /api/v1/users/:id/unblock  =>  unblock a user (admin only)
router.patch("/:id/unblock", [...id, auth, role(["admin"])], asyncHandler(usersController.unblock));

// DELETE /api/v1/users/:id  =>  delete a user (admin only)
router.delete("/:id", [...id, auth, role(["admin"])], asyncHandler(usersController.remove));

module.exports = router;