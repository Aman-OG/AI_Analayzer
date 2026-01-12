/**
 * Utility to wrap async functions and catch errors, passing them to next()
 */
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
