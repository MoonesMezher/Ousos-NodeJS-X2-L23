const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Sad", "Happy", "Funny"]
    },
    privacy: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const Post = mongoose.model("Post", postSchema);

module.exports = Post;