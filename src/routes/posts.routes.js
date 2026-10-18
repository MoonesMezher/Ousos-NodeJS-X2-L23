const express = require("express");
const postsController = require("../controllers/posts.controller");
const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const auth = require("../middlewares/auth");
const optionalAuth = auth.optionalAuth;
const { addPostValidation } = require("../validation/post.validate");
const router = express.Router();

// GET /api/v1/posts  =>  all posts (with pagination, filter, search)
router.get("/", optionalAuth, asyncHandler(postsController.getAll));

// GET /api/v1/posts/count  =>  total number of posts and breakdown (must be before /:id)
router.get("/count", asyncHandler(postsController.count));

// GET /api/v1/posts/filter?status=Happy&privacy=false  =>  filter by query params (must be before /:id)
router.get("/filter", optionalAuth, asyncHandler(postsController.filter));

// GET /api/v1/posts/:id  =>  single post by id
router.get("/:id", [...id, optionalAuth], asyncHandler(postsController.getById));

// POST /api/v1/posts  =>  create post (auth required)
router.post("/", [auth, ...addPostValidation], asyncHandler(postsController.add));

// PUT /api/v1/posts/:id  =>  full update (auth required, owner or admin)
router.put("/:id", [...id, auth, ...addPostValidation], asyncHandler(postsController.update));

// PATCH /api/v1/posts/:id/privacy  =>  toggle privacy (auth required, owner or admin)
router.patch("/:id/privacy", [...id, auth], asyncHandler(postsController.updatePrivacy));

// DELETE /api/v1/posts/:id  =>  delete post (auth required, owner or admin)
router.delete("/:id", [...id, auth], asyncHandler(postsController.remove));

module.exports = router;