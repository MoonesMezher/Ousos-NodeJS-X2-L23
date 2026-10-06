const foundPost = require("../helpers/foundPost");
const Post = require("../models/Post")

class PostsController {
    getAll = async (req, res) => {
        const posts = await Post.find();

        res.status(200).json({ posts })
    }

    getById = async (req, res) => {
        const post = req.__data__;

        res.status(200).json({ post })
    }

    add = async (req, res) => {
        const { content, status } = req.body;

        if(!content || !status) return res.status(400).json({ message: "Invalid Data" })

        if(typeof content !== "string") {
            return res.status(400).json({ message: "Invalid Content" })
        }

        if(typeof status !== "string") {
            return res.status(400).json({ message: "Invalid Status" })
        }

        if(!["Sad", "Happy", "Funny"].includes(status)) {
            return res.status(400).json({ message: "Invalid Status" })
        }

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

        if(!content || !status) return res.status(400).json({ message: "Invalid Data" })

        if(typeof content !== "string") {
            return res.status(400).json({ message: "Invalid Content" })
        }

        if(typeof status !== "string") {
            return res.status(400).json({ message: "Invalid Status" })
        }

        if(!["Sad", "Happy", "Funny"].includes(status)) {
            return res.status(400).json({ message: "Invalid Status" })
        }

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