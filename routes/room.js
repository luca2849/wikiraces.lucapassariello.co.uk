// Libraries
const express = require(`express`);
const router = express.Router();
const axios = require(`axios`);
// Util Functions
const util = require("../util.js");
// Middleware
const roomCheck = require("../middleware/roomCheck");
const sessionIdCheck = require("../middleware/sessionIdCheck");
// DB Models
const Room = require("../models/Room");

router.get("/join", (req, res) => {
    res.render("joinRoom.ejs");
});
router.post("/join", sessionIdCheck, async (req, res) => {
    if (req.body.roomId === "" || req.body.username === "") {
        console.log("Validation Error");
        return res.redirect("/room/join");
    }
    if (req.body.roomId.length !== 5) {
        console.log("Validation Length Error");
        return res.redirect("/room/join");
    }
    const roomId = req.body.roomId.toUpperCase();
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
        console.log("Room Not Found");
        return res.redirect(`/room/join?error=${req.body.roomId}`);
    }
    await util.joinRoom(roomId, req.session.userId, req.body.username);
    return res.redirect(`/room/${roomId}/play`);
});

router.get("/create", (req, res) => {
    res.render("createRoom.ejs");
});

router.post("/create", sessionIdCheck, async (req, res) => {
    if (!req.body.endPage && !req.body.startPage && !req.body.roomId) {
        return res.redirect(`/room/create`);
    }
    if (
        (await util.doesPageExist(req.body.startPage)) &&
        (await util.doesPageExist(req.body.endPage))
    ) {
        const startPage = await util.getPagesWithRedirects(req.body.startPage);
        const endPage = await util.getPagesWithRedirects(req.body.endPage);
        room = new Room({
            roomId: req.body.roomId.toUpperCase(),
            startPage: startPage,
            endPage: endPage,
        });
        await room.save();
        res.redirect(`/room/join?id=${req.body.roomId}`);
    } else {
        res.redirect(`/room/create?error=1`);
    }
});

router.get("/:id/wiki/:term", async (req, res) => {
    try {
        const uri = `http://en.wikipedia.org/w/api.php?action=parse&page=${req.params.term}&format=json&prop=text|headhtml&contentmodel=wikitext`;
        const resp = await axios.get(encodeURI(uri));
        let body = resp.data.parse.text["*"];
        const new_body = body.replace(
            /href="\/wiki/g,
            `href="/room/${req.params.id}/wiki`
        );
        return res.render(`wiki.ejs`, {
            body: new_body,
            title: resp.data.parse.title,
            userId: req.session.userId,
        });
    } catch (error) {
        console.error(error);
        return res.redirect(`/${req.params.id}/wiki/Wikipedia`);
    }
});

// Route to catch some articles which have slashes in the titles
// Replaces the slash with a %2F code
router.get("/:id/wiki/:term/:term2", (req, res) => {
    res.redirect(
        `/room/${req.params.id}/wiki/${req.params.term}%2F${req.params.term2}`
    );
});

router.get("/:id/play", [sessionIdCheck, roomCheck], async (req, res) => {
    const roomId = req.params.id;
    const userId = req.session.userId;
    if (!roomId || !userId) {
        return res.redirect("/room/join");
    }
    const room = await Room.findOne({ roomId });
    if (!room) {
        console.log("Room Not Found");
        return res.redirect(`/room/join`);
    }
    let currentUser = await util.findInRoom(userId, roomId);
    return res.render(`play.ejs`, {
        userId: userId,
        roomId: roomId,
        startPage: room.startPage,
        endPage: room.endPage,
        host: currentUser.host,
    });
});

module.exports = router;
