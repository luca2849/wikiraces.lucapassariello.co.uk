const util = require("../util");

module.exports = async (req, res, next) => {
    try {
        //util.log(
        //    `[${req.connection.remoteAddress}] -> [${req.originalUrl}]`,
        //    "access.log"
        //);
    } catch (error) {
        console.error(error);
    }
    next();
};
