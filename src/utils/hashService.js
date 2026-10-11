const bcrypt = require('bcryptjs');
// argon2

class HashService {
    hash = async (password) => {
        try {
            return await bcrypt.hash(password, 12);
        } catch (error) {
            return error.message;
        }
    }

    compare = async (password, storedPassword) => {
        try {
            return await bcrypt.compare(password, storedPassword);
        } catch (error) {
            return error.message;
        }
    }
}

module.exports = new HashService();