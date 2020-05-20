const ROOMS = require("../rooms");

module.exports = (req, res, next) => {
    try {
        const roomId = req.params.id;
        const userId = req.session.userId;
        if (ROOMS[roomId] === undefined || !(userId in ROOMS[roomId].users)) {
            console.log(ROOMS);
            console.log(req.params.id);
            console.log(req.session.userId);
            console.log(ROOMS[req.params.id]);
            res.status(302).redirect("/");
        } else {
            next();
        }
    } catch (error) {
        console.log(ROOMS);
        console.log(req.params.id);
        console.log(req.session.userId);
        console.log(ROOMS[req.params.id]);
        res.status(302).redirect("/");
    }
};
