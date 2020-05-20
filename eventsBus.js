const ee = require("./eventEmiter");
const ROOMS = require("./rooms");

ee.on("joinRoom", (data) => {
    const { userId, roomId, username } = data;
    console.log(`USER ${userId} (${username}) JOINING ROOM - ${roomId}`);
    ROOMS[roomId].users[userId] = {
        name: username,
        currentUrl: "",
        found: false,
    };
});

ee.on("leaveRoom", (data) => {
    const { userId, roomId } = data;
    console.log(`USER ${userId} LEAVING ROOM - ${roomId}`);
    try {
        delete ROOMS[roomId].users[userId];
        // Delete room if no users are present
        const users = Object.keys(ROOMS[roomId].users).length;
        if (users === 0) {
            delete ROOMS[roomId];
        }
    } catch (error) {}
});

module.exports = ee;
