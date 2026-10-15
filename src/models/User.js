const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    block: {
        type: Boolean,
        default: false
    },
    blockCount: {
        type: Number,
        default: 0
    },
    blockedUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

module.exports = User;