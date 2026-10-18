module.exports = function(schema) {
    schema.statics.paginate = async function(page = 1, limit = 10, query = {}, populate = "") {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const total = await this.countDocuments(query);
        const pages = Math.ceil(total / limitNum) || 1;
        const skip = (pageNum - 1) * limitNum;
        const isNext = pageNum < pages;
        const isPrev = pageNum > 1;

        let queryBuilder = this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        const items = await queryBuilder.lean();

        return {
            items,
            pagination: {
                total,
                pages,
                page: pageNum,
                isNext,
                isPrev,
                limit: limitNum
            }
        };
    };
};