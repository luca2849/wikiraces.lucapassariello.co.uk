const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    startPage: {
        type: String,
        required: true,
    },
    endPage: {
        type: String,
        required: true,
    },
    users: [
        {
            userId: {
                type: String,
                required: true,
            },
            currentUrl: {
                type: String,
            },
            found: {
                type: Boolean,
                default: false,
            },
            username: {
                type: String,
                required: true,
            },
            host: {
                type: Boolean,
                required: true,
            },
        },
    ],
});

module.exports = Room = mongoose.model("room", RoomSchema);
