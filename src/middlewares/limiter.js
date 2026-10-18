const { rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
	limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { 
        error: 'Too many requests, please try again later.' 
    },
});

const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { 
        error: 'Too many requests, please try again later.' 
    },
});

module.exports = {
    loginLimiter,
    appLimiter
}