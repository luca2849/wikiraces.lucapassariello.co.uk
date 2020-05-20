const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("./sockets.js").init(http);
const session = require("express-session");
const bodyParser = require("body-parser");
const util = require("./util.js");
const ROOMS = require("./rooms.js");
const ee = require(`./eventEmiter`);

// Init Session
app.use(
    session({
        secret: "F66FCCED1BEA9C74",
        saveUninitialized: true,
        resave: true,
    })
);

// Init Middleware
app.use(express.json({ extend: false }));

// Parse Request Bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Set View Engine (EJS)
app.set("view engine", "ejs");

// Specify views file
app.set("views", __dirname + "/views");

// Specify static content route
app.use("/static", express.static("static"));

// Internal Event Emitters
const events = require("./eventsBus");

// SocketIO Sockets
io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected`);
    socket.on("disconnect", () => {
        socket.removeAllListeners();
        console.log(`Socket ${socket.id} disconnected`);
    });
    socket.on("createRoom", async (data) => {
        // Get ID of Selected Pages
        const startPage = await util.getPagesWithRedirects(data.startPage);
        const endPage = await util.getPagesWithRedirects(data.endPage);
        ROOMS[data.roomId] = {
            users: {},
            startPage: startPage,
            endPage: endPage,
        };
    });
    socket.on("leaveRoom", (data) => {
        ee.emit("leaveRoom", { roomId: data.roomId, userId: data.userId });
        socket.emit("update", ROOMS[data.roomId]);
        socket.broadcast.emit("update", ROOMS[data.roomId]);
    });
    socket.on("urlUpdate", (data) => {
        try {
            if (ROOMS[data.roomId].users[data.userId]) {
                ROOMS[data.roomId].users[data.userId].currentUrl =
                    data.currentUrl;
                socket.broadcast.emit("update", ROOMS[data.roomId]);
                socket.emit("update", ROOMS[data.roomId]);
            }
        } catch (error) {
            console.error(error);
        }
    });
    socket.on("foundPage", (data) => {
        try {
            ROOMS[data.roomId].users[data.userId].found = true;
            socket.emit("update", ROOMS[data.roomId]);
            socket.broadcast.emit("update", ROOMS[data.roomId]);
        } catch (error) {
            console.error(error);
        }
    });
});

// Define Routes
app.use("/", require("./routes/main"));
app.use("/room", require("./routes/room"));

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server Listening on Port ${PORT}`);
});
