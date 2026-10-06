const errorMiddleware = (err, req, res, next) => {
    const message = err.message;
    
    return res.status(500).json({ message });
}

module.exports = errorMiddleware;