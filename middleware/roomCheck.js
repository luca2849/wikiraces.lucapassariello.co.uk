const Room = require("../models/Room");

module.exports = async (req, res, next) => {
    try {
        const room = await Room.findOne({
            roomId: req.params.id.toUpperCase(),
        });
        if (!room) {
            console.log("Room Not Found");
            return red.redirect(`/room/join`);
        }
        for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].userId === req.session.userId) {
                return next();
            }
        }
    } catch (error) {
        console.error(error);
        return red.redirect(`/room/join`);
    }
    return res.redirect("/room/join");
};
