const express = require("express");
const postsController = require("../controllers/posts.controller");
const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const Post = require("../models/Post");
const found = require("../middlewares/found");
const router = express.Router();

router.get("/", asyncHandler(postsController.getAll));
router.get("/:id", [id, found(Post)], asyncHandler(postsController.getById));
router.post("/", asyncHandler(postsController.add));
router.put("/:id", [id], asyncHandler(postsController.update));
router.patch("/:id/privacy", [id], asyncHandler(postsController.updatePrivacy))
router.delete("/:id", [id], asyncHandler(postsController.remove));

module.exports = router;