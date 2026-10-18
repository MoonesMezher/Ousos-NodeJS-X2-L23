const Post = require("../models/Post");

class PostsController {
    // GET /api/v1/posts
    getAll = async (req, res) => {
        const { page, limit, status, privacy, search, user } = req.query;
        const query = {};

        // Privacy & visibility rules:
        // Admin sees everything. Logged in user sees public + their own. Guests see public posts.
        if (req._user) {
            if (req._user.role !== "admin") {
                query.$or = [{ privacy: false }, { user: req._user._id }];
            }
        } else if (privacy === undefined) {
            query.privacy = false;
        }

        // Apply explicit privacy filter if requested
        if (privacy !== undefined && privacy !== "") {
            query.privacy = privacy === "true";
        }

        // Apply status filter
        if (status) {
            query.status = status;
        }

        // Apply keyword search on post content
        if (search) {
            query.content = { $regex: search, $options: "i" };
        }

        // Apply author filter
        if (user === "mine" && req._user) {
            query.user = req._user._id;
            delete query.$or;
        } else if (user && user !== "mine") {
            query.user = user;
        }

        // If pagination is requested
        if (page) {
            const data = await Post.paginate(page, limit || 12, query, {
                path: "user",
                select: "email role age"
            });
            return res.status(200).json(data);
        }

        const posts = await Post.find(query)
            .populate("user", "email role age")
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({ count: posts.length, posts });
    };

    // GET /api/v1/posts/count
    count = async (req, res) => {
        const total = await Post.countDocuments();
        const happy = await Post.countDocuments({ status: "Happy" });
        const funny = await Post.countDocuments({ status: "Funny" });
        const sad = await Post.countDocuments({ status: "Sad" });
        const publicPosts = await Post.countDocuments({ privacy: false });
        const privatePosts = await Post.countDocuments({ privacy: true });

        res.status(200).json({
            total,
            stats: {
                happy,
                funny,
                sad,
                public: publicPosts,
                private: privatePosts
            }
        });
    };

    // GET /api/v1/posts/filter?status=Happy&privacy=false
    filter = async (req, res) => {
        const { status, privacy, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (privacy !== undefined && privacy !== "") query.privacy = privacy === "true";
        if (search) query.content = { $regex: search, $options: "i" };

        const posts = await Post.find(query)
            .populate("user", "email role age")
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({ count: posts.length, posts });
    };

    // GET /api/v1/posts/:id
    getById = async (req, res) => {
        const post = await Post.findById(req.params.id)
            .populate("user", "email role age");

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        res.status(200).json({ post });
    };

    // POST /api/v1/posts
    add = async (req, res) => {
        const { content, status, privacy } = req.body;
        const userId = req._user ? req._user._id : null;

        const post = await Post.create({
            content,
            status: status || "Happy",
            privacy: !!privacy,
            user: userId
        });

        if (userId) {
            await post.populate("user", "email role age");
        }

        res.status(201).json({ message: "Post Created", post });
    };

    // PUT /api/v1/posts/:id
    update = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        // Authorization check: only post owner or admin can update
        if (post.user && req._user) {
            const isOwner = post.user.toString() === req._user._id.toString();
            const isAdmin = req._user.role === "admin";
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "Forbidden: You are not authorized to edit this post" });
            }
        }

        const { content, status, privacy } = req.body;

        if (content !== undefined) post.content = content;
        if (status !== undefined) post.status = status;
        if (privacy !== undefined) post.privacy = !!privacy;

        await post.save();
        await post.populate("user", "email role age");

        res.status(200).json({ message: "Post Updated", post });
    };

    // PATCH /api/v1/posts/:id/privacy
    updatePrivacy = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        // Authorization check: only post owner or admin can toggle privacy
        if (post.user && req._user) {
            const isOwner = post.user.toString() === req._user._id.toString();
            const isAdmin = req._user.role === "admin";
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "Forbidden: You are not authorized to change privacy" });
            }
        }

        post.privacy = !post.privacy;
        await post.save();
        await post.populate("user", "email role age");

        res.status(200).json({ message: "Privacy Updated", post });
    };

    // DELETE /api/v1/posts/:id
    remove = async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post Not Found" });

        // Authorization check: only post owner or admin can delete
        if (post.user && req._user) {
            const isOwner = post.user.toString() === req._user._id.toString();
            const isAdmin = req._user.role === "admin";
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "Forbidden: You are not authorized to delete this post" });
            }
        }

        await Post.findByIdAndDelete(post._id);

        res.status(200).json({ message: "Post Deleted Successfully" });
    };
}

module.exports = new PostsController();