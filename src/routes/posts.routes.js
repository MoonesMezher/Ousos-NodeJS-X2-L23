const express = require("express");
const postsController = require("../controllers/posts.controller");
const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const { addPostValidation } = require("../validation/post.validate");
const router = express.Router();

// GET /api/v1/posts  =>  all posts
router.get("/", asyncHandler(postsController.getAll));

// GET /api/v1/posts/count  =>  total number of posts (must be before /:id)
router.get("/count", asyncHandler(postsController.count));

// GET /api/v1/posts/filter?status=Happy&privacy=false  =>  filter by query params (must be before /:id)
router.get("/filter", asyncHandler(postsController.filter));

// GET /api/v1/posts/:id  =>  single post by id
router.get("/:id", [...id], asyncHandler(postsController.getById));

// POST /api/v1/posts  =>  create post
router.post("/", [...addPostValidation], asyncHandler(postsController.add));

// PUT /api/v1/posts/:id  =>  full update
router.put("/:id", [...id, ...addPostValidation], asyncHandler(postsController.update));

// PATCH /api/v1/posts/:id/privacy  =>  toggle privacy
router.patch("/:id/privacy", [...id], asyncHandler(postsController.updatePrivacy));

// DELETE /api/v1/posts/:id  =>  delete post
router.delete("/:id", [...id], asyncHandler(postsController.remove));

module.exports = router;