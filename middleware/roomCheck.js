const Room = require("../models/Room");

module.exports = async (req, res, next) => {
    try {
        await Room.findOne(
            { roomId: req.params.id.toUpperCase() },
            (err, room) => {
                if (err) {
                    console.error(err);
                    return res.redirect("/room/join");
                }
                if (!room) {
                    console.log("Room not found");
                    return res.redirect("/room/join");
                }
                for (let i = 0; i < room.users.length; i++) {
                    if (room.users[i].userId === req.session.userId) {
                        return next();
                    }
                }
                return res.redirect("/room/join");
            }
        );
    } catch (error) {
        console.error(error);
        return res.redirect("/room/join");
    }
};
