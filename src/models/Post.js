const mongoose = require("mongoose");
const paginate = require("../plugins/paginate");

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Sad", "Happy", "Funny"],
        default: "Happy"
    },
    privacy: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }
});

// Attach pagination plugin
postSchema.plugin(paginate);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;