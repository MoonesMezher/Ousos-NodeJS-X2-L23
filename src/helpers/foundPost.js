const Post = require("../models/Post");

const foundPost = async (req, res) => {
    const id = req.params.id;

    const post = await Post.findById(id);

    if(!post) return res.status(404).json({ message: "Post Not Found" });

    return post;
}

module.exports = foundPost;