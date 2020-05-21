const util = require("../util");

module.exports = (req, res, next) => {
    try {
        if (!req.session.userId) {
            const userId = util.createId(10);
            req.session.userId = userId;
            next();
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
};
