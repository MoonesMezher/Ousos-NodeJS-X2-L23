const blockHandler = {
    // Check if user is blocked (and expire old blocks automatically)
    check: async (user) => {
        // Expire old block if duration has passed
        if (user.blockedUntil && user.blockedUntil < Date.now()) {
            user.block = false;
            user.blockCount = 0;
            user.blockedUntil = null;
            await user.save();
        }

        // Apply block if blockCount reached the threshold
        if (user.blockCount >= 5) {
            user.block = true;
            user.blockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();
        }

        return user.block;
    },

    // Called on failed login attempt — increments count then re-checks
    fail: async (user) => {
        user.blockCount += 1;
        await user.save();

        return blockHandler.check(user);
    },

    // Called on successful login — fully resets the block state
    success: async (user) => {
        user.blockCount = 0;
        user.block = false;
        user.blockedUntil = null;
        await user.save();
    },
};

module.exports = blockHandler;
