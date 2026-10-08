const express = require("express");
const postsController = require("../controllers/posts.controller");
const asyncHandler = require("../utils/asyncHandler");
const id = require("../middlewares/id");
const { addPostValidation } = require("../validation/post.validate");
const router = express.Router();

router.get("/", asyncHandler(postsController.getAll));
router.get("/:id", [...id], asyncHandler(postsController.getById));
router.post("/",  
    // new => validation
    [...addPostValidation]

,asyncHandler(postsController.add));
router.put("/:id", [...id, ...addPostValidation], asyncHandler(postsController.update));
router.patch("/:id/privacy", [...id], asyncHandler(postsController.updatePrivacy))
router.delete("/:id", [...id], asyncHandler(postsController.remove));

module.exports = router;