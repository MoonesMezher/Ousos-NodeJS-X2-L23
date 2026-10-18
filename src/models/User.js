const mongoose = require("mongoose");
const hashService = require("../utils/hashService");
const paginate = require("../plugins/paginate");

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
    },
    isLogedIn: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true, 
    toJSON: { virtuals: true } 
});

// virtuals
userSchema.virtual('bitrthDate').get(function() {
    return new Date().getFullYear() - (this.age);
}); 
// methods
userSchema.methods.compare = async function(password) {
    return await hashService.compare(password, this.password); // this => document
}; // const user = await User.findOne({...}) // user.email1()

// statics
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email }); // this => model => collection
}; // await User.findByEmail("dm;qdwqd")

// triggers
// plugins
userSchema.plugin(paginate);

const User = mongoose.model("User", userSchema);

module.exports = User;