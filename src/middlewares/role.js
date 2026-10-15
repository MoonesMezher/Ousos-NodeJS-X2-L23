const role = (roles) => {
    return (req, res, next) => {
        const role = req._user.role;

        if(!roles.includes(role)) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        
        next();
    }
}

module.exports = role