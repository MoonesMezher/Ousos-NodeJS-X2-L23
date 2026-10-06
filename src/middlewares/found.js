const found = (model) => {
    return async (req, res, next) => {
        const id = req.params.id;
    
        const data = await model.findById(id);
    
        if(!data) return res.status(404).json({ message: " Not Found" });
    
        req.__data__ = data;
    
        next();
    }
}

module.exports = found;