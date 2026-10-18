require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const connectDBWithoutApp = require("../utils/connectDbWithoutApp");
const hashService = require("../utils/hashService");

const TOTAL_USERS = 100;
const TOTAL_POSTS = 500;
const DEFAULT_PASSWORD = "Password123!";

/**
 * Generate 100 realistic users
 * All seeded users will have the default password: Password123!
 */
const generateUsers = (hashedPassword) => {
    const users = [];

    for (let i = 1; i <= TOTAL_USERS; i++) {
        // Block the last 5 users for testing blocked user endpoints
        const isBlocked = i > 95;

        users.push({
            email: `user${i}@example.com`,
            password: hashedPassword,
            age: 18 + (i % 50),
            role: "user",
            block: isBlocked,
            blockCount: isBlocked ? 5 : 0,
            blockedUntil: isBlocked ? new Date(Date.now() + 60 * 60 * 1000) : null,
            isLogedIn: false
        });
    }

    return users;
};

/**
 * Generate 500 posts
 * Content length is kept between 5 and 20 characters to satisfy validation rules
 */
const generatePosts = (insertedUsers = []) => {
    const statuses = ["Happy", "Funny", "Sad"];
    const topics = [
        "Vibes",
        "Smile",
        "Chill",
        "Code",
        "NodeJS",
        "Coffee",
        "Happy",
        "Funny",
        "Sad",
        "Great"
    ];

    const posts = [];

    for (let i = 1; i <= TOTAL_POSTS; i++) {
        const topic = topics[(i - 1) % topics.length];
        const status = statuses[(i - 1) % statuses.length];
        // Privacy: ~30% true, ~70% false
        const privacy = i % 3 === 0;

        // Content format: "Post #X - Topic"
        const content = `Post #${i} - ${topic}`;

        const author = insertedUsers.length > 0 ? insertedUsers[(i - 1) % insertedUsers.length]._id : null;

        posts.push({
            content,
            status,
            privacy,
            user: author
        });
    }

    return posts;
};

/**
 * Ensure admin account exists from .env
 */
const ensureAdmin = async () => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        return;
    }

    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
        const hashedAdminPassword = await hashService.hash(process.env.ADMIN_PASSWORD);
        await User.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedAdminPassword,
            role: "admin",
            age: 30
        });
        console.log(`[+] Admin created: ${process.env.ADMIN_EMAIL}`);
    } else {
        console.log(`[i] Admin already exists: ${process.env.ADMIN_EMAIL}`);
    }
};

/**
 * Main seed function
 */
const seed = async () => {
    console.log("==========================================");
    console.log("       STARTING FULL DATABASE SEED        ");
    console.log("==========================================");

    await connectDBWithoutApp();

    console.log("\n[1/4] Cleaning existing data...");
    // Remove all non-admin users and all posts
    const deletedUsers = await User.deleteMany({ role: { $ne: "admin" } });
    const deletedPosts = await Post.deleteMany({});
    console.log(`[-] Removed ${deletedUsers.deletedCount} standard users`);
    console.log(`[-] Removed ${deletedPosts.deletedCount} posts`);

    console.log("\n[2/4] Ensuring admin account...");
    await ensureAdmin();

    console.log("\n[3/4] Generating and seeding 100 users...");
    console.log(`    (Default password for all users: "${DEFAULT_PASSWORD}")`);
    const hashedPassword = await hashService.hash(DEFAULT_PASSWORD);
    const users = generateUsers(hashedPassword);
    const insertedUsers = await User.insertMany(users);
    console.log(`[+] Successfully inserted ${insertedUsers.length} users!`);

    console.log("\n[4/4] Generating and seeding 500 posts...");
    const posts = generatePosts(insertedUsers);
    const insertedPosts = await Post.insertMany(posts);
    console.log(`[+] Successfully inserted ${insertedPosts.length} posts!`);

    console.log("\n==========================================");
    console.log("       DATABASE SEED COMPLETED!           ");
    console.log("==========================================");
    console.log(`Total Users in DB: ${await User.countDocuments()}`);
    console.log(`Total Posts in DB: ${await Post.countDocuments()}`);
    console.log("==========================================");
};

seed()
    .then(async () => {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
        process.exit(0);
    })
    .catch(async (err) => {
        console.error("[-] Error during seeding:", err.message);
        try {
            await mongoose.disconnect();
        } catch (_) {}
        process.exit(1);
    });
