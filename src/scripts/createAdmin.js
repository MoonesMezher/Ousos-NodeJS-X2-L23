require("dotenv").config();
const User = require("../models/User");
const connectDBWithoutApp = require("../utils/connectDbWithoutApp");
const hashService = require("../utils/hashService");

const createAdmin = async () => {
    const hashed = await hashService.hash(process.env.ADMIN_PASSWORD);

    const data = {
        email: process.env.ADMIN_EMAIL,
        password: hashed,
        role: "admin"
    };

    await connectDBWithoutApp();

    await User.create(data);

    return "Created";
}

createAdmin()
    .then(res => {
        console.log("Created Admin")
        process.exit(0)
    })
    .catch(err => {
        console.log("Error in Created Admin", err.message);
        process.exit(0)
    })

