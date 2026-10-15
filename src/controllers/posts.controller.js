const Post = require("../models/Post");

class PostsController {
    // GET /api/v1/posts
    getAll = async (req, res) => {
        const posts = await Post.find().select("-__v -updatedAt");

        res.status(200).json({ posts });
    }

    // GET /api/v1/posts/count
    count = async (req, res) => {
        const total = await Post.countDocuments();

        res.status(200).json({ total });
    }

    // GET /api/v1/posts/filter?status=Happy&privacy=false
    filter = async (req, res) => {
        const { status, privacy } = req.query;

        const query = {};

        if (status) query.status = status;
        if (privacy !== undefined) query.privacy = privacy === "true";

        const posts = await Post.find(query).select("-__v -updatedAt");

        res.status(200).json({ count: posts.length, posts });
    }

    // GET /api/v1/posts/:id
    getById = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        res.status(200).json({ post });
    }

    // POST /api/v1/posts
    add = async (req, res) => {
        const { content, status } = req.body;

        const post = await Post.create({ content, status });

        res.status(200).json({ post });
    }

    // PUT /api/v1/posts/:id
    update = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        const { content, status } = req.body;

        post.content = content;
        post.status = status;

        await post.save();

        res.status(200).json({ post });
    }

    // PATCH /api/v1/posts/:id/privacy
    updatePrivacy = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        post.privacy = !post.privacy;
        await post.save();

        res.status(200).json({ post });
    }

    // DELETE /api/v1/posts/:id
    remove = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        await Post.findByIdAndDelete(post._id);

        res.status(200).json({ message: "Deleted" });
    }
}

module.exports = new PostsController();