const express = require("express");
const app = express();
const socketio = require("socket.io");
const io = socketio();
app.io = io;
const session = require("express-session");
const bodyParser = require("body-parser");
const connectDB = require("./config/db.js");
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

// Connect to Database
connectDB();

// Internal Event Emitters
const events = require("./eventsBus");

// SocketIO Sockets
io.on("connection", (socket) => {
    socket.on("error", function (reason) {
        console.error("Unable to connect Socket.IO", reason);
    });

    console.log(`Socket ${socket.id} connected`);
    socket.on("disconnect", () => {
        socket.removeAllListeners();
        console.log(`Socket ${socket.id} disconnected`);
    });
    socket.on("leaveRoom", async (data) => {
        await util.leaveRoom(data.roomId, data.userId);
        const room = await Room.findOne({ roomId: data.roomId });
        socket.emit("update", JSON.stringify(room));
        socket.broadcast.emit("update", JSON.stringify(room));
    });
    socket.on("urlUpdate", async (data) => {
        console.log(data.userId);
        try {
            await util.updateUrl(data.roomId, data.userId, data.currentUrl);
            const room = await Room.findOne({ roomId: data.roomId });
            socket.emit("update", JSON.stringify(room));
            socket.broadcast.emit("update", JSON.stringify(room));
        } catch (error) {
            console.error(error);
        }
    });
    socket.on("foundPage", async (data) => {
        try {
            util.foundPage(data.roomId, data.userId);
            const room = await Room.findOne({ roomId: data.roomId });
            socket.emit("update", JSON.stringify(room));
            socket.broadcast.emit("update", JSON.stringify(room));
        } catch (error) {
            console.error(error);
        }
    });
});

// Define Routes
app.use("/", require("./routes/main"));
app.use("/room", require("./routes/room"));

// function wwwRedirect(req, res, next) {
//     if (req.headers.host.slice(0, 4) === "www.") {
//         var newHost = req.headers.host.slice(4);
//         return res.redirect(
//             301,
//             req.protocol + "://" + newHost + req.originalUrl
//         );
//     }
//     next();
// }

app.set("trust proxy", true);
// app.use(wwwRedirect);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
