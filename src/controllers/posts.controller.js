const foundPost = require("../helpers/foundPost");
const Post = require("../models/Post")

class PostsController {
    getAll = async (req, res) => {
        const posts = await Post.find().select("-__v -updatedAt");

        res.status(200).json({ posts })
    }

    getById = async (req, res) => {
        const post = await foundPost(req, res);

        res.status(200).json({ post })
    }

    add = async (req, res) => {
        const { content, status } = req.body;

        const post = await Post.create({ content, status });

        res.status(200).json({ post });
    }

    updatePrivacy = async (req, res) => {
        const post = await foundPost(req, res);

        post.privacy = !post.privacy;
        await post.save();

        res.status(200).json({ post });
    }

    update = async (req, res) => {
        const post = await foundPost(req, res);

        const { content, status } = req.body;

        post.content = content;
        post.status = status;

        await post.save();

        res.status(200).json({ post })
    }

    remove = async (req, res) => {
        const post = await foundPost(req, res);

        await Post.findByIdAndDelete(post._id);

        res.status(200).json({ message: "Deleted" })
    }
}

module.exports = new PostsController();