const User = require("../models/User");
const hashService = require("../utils/hashService");
const jwtService = require("../utils/jwtService");
const blockHandler = require("../helpers/blockHandler");

class UsersController {
    // GET /api/v1/users  =>  admin only
    getAll = async (req, res) => {
        const users = await User.find({ role: "user" }).select("-password");

        res.status(200).json({ users });
    }

    // GET /api/v1/users/profile  =>  admin + user
    profile = async (req, res) => {
        const user = req._user;

        res.status(200).json({ user });
    }

    // GET /api/v1/users/:id  =>  admin only
    getById = async (req, res) => {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        res.status(200).json({ user });
    }

    // POST /api/v1/users/signup
    signup = async (req, res) => {
        const { email, password } = req.body;

        const hashed = await hashService.hash(password);
        await User.create({ email, password: hashed });

        res.status(201).json({ message: "Added" });
    }

    // POST /api/v1/users/signin
    signin = async (req, res) => {
        const { email, password } = req.body;
        const emailIsExist = await User.findOne({ email });

        if (!emailIsExist) {
            return res.status(400).json({ message: "Invalid Data" });
        }

        // Check / expire / apply block
        const isBlocked = await blockHandler.check(emailIsExist);

        if (isBlocked) {
            return res.status(401).json({ message: "Try Again Later" });
        }

        const passwordIsTrue = await emailIsExist.compare(password);

        if (!passwordIsTrue) {
            await blockHandler.fail(emailIsExist); // blockCount++ → save → re-check
            return res.status(400).json({ message: "Invalid Data" });
        }

        await blockHandler.success(emailIsExist); // reset count, block, blockedUntil

        const token = jwtService.sign({ email });
        emailIsExist.isLogedIn = true;
        await emailIsExist.save();

        res.status(200).json({ message: "Logged in successfully", token });
    }

    // POST /api/v1/users/logout
    logout = async (req, res) => {
        const id = req._user._id;
        const user = await User.findById(id);
        user.isLogedIn = false;
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    }

    // PATCH /api/v1/users/profile  =>  admin + user
    updateProfile = async (req, res) => {
        const user = req._user;
        const { age } = req.body;

        const updated = await User.findByIdAndUpdate(
            user._id,
            { age },
            { new: true }
        ).select("-password");

        res.status(200).json({ user: updated });
    }

    // PUT /api/v1/users/block/:id  =>  admin only
    block = async (req, res) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Not Found" });
        }

        if (user.block) {
            return res.status(400).json({ message: "Blocked Already" });
        }

        user.block = true;
        await user.save();

        res.status(200).json({ message: "Blocked" });
    }

    // PATCH /api/v1/users/:id/unblock  =>  admin only
    unblock = async (req, res) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Not Found" });
        }

        if (!user.block) {
            return res.status(400).json({ message: "User Is Not Blocked" });
        }

        user.block = false;
        user.blockCount = 0;
        user.blockedUntil = null;
        await user.save();

        res.status(200).json({ message: "Unblocked" });
    }

    // DELETE /api/v1/users/:id  =>  admin only
    remove = async (req, res) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Not Found" });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Deleted" });
    }

    // GET /api/v1/users/blocked  =>  all blocked users (admin only)
    // concept: filtering documents by a boolean field
    getBlocked = async (req, res) => {
        const users = await User.find({ block: true }).select("-password");

        res.status(200).json({ count: users.length, users });
    }

    // GET /api/v1/users/search?email=  =>  search by email (admin only)
    // concept: regex search + query params
    search = async (req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email query is required" });
        }

        // case-insensitive partial match
        const users = await User.find({
            email: { $regex: email, $options: "i" }
        }).select("-password");

        res.status(200).json({ count: users.length, users });
    }

    // PATCH /api/v1/users/change-password  =>  change own password (auth)
    // concept: verify current password before allowing update
    changePassword = async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req._user._id);

        const isMatch = await hashService.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await hashService.hash(newPassword);
        await user.save();

        res.status(200).json({ message: "Password Changed Successfully" });
    }

    pagination = async (req, res) => {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const search = req.query.email || req.query.search;
        const blocked = req.query.blocked;

        const query = {};
        if (req.query.role) {
            query.role = req.query.role;
        }
        if (search) {
            query.email = { $regex: search, $options: "i" };
        }
        if (blocked === "true") {
            query.block = true;
        } else if (blocked === "false") {
            query.block = false;
        }

        const data = await User.paginate(page, limit, query);
        data.items = data.items.map(u => {
            const { password, ...rest } = u;
            return rest;
        });

        res.status(200).json(data);
    }

    // GET /api/v1/users/stats  =>  admin only
    stats = async (req, res) => {
        const totalUsers = await User.countDocuments();
        const regularUsers = await User.countDocuments({ role: "user" });
        const adminUsers = await User.countDocuments({ role: "admin" });
        const blockedUsers = await User.countDocuments({ block: true });
        const activeUsers = totalUsers - blockedUsers;

        res.status(200).json({
            totalUsers,
            regularUsers,
            adminUsers,
            blockedUsers,
            activeUsers
        });
    }
}

module.exports = new UsersController();