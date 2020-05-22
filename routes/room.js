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
    if (!req.session.userId) {
        const userId = util.createId(10);
        req.session.userId = userId;
    }
    res.render("joinRoom.ejs", { userId: req.session.userId });
});
router.post("/join", async (req, res) => {
    if (req.body.roomId === "" || req.body.username === "") {
        console.log("Validation Error");
        return res.redirect("/room/join");
    }
    if (req.body.roomId.length !== 5) {
        console.log("Validation Length Error");
        return res.redirect("/room/join");
    }
    await Room.findOne(
        { roomId: req.body.roomId.toUpperCase() },
        async (err, foundObject) => {
            if (err) {
                console.error(err);
                return res.redirect(`/room/join?error=${req.body.roomId}`);
            } else {
                if (!foundObject) {
                    console.log("Room not found");
                    return res.redirect(`/room/join?error=${req.body.roomId}`);
                } else {
                    await util.joinRoom(
                        req.body.roomId,
                        req.session.userId,
                        req.body.username
                    );
                    return res.redirect(`/room/${req.body.roomId}/play`);
                }
            }
        }
    );
});

router.get("/create", sessionIdCheck, (req, res) => {
    res.render("createRoom.ejs");
});

router.post("/create", sessionIdCheck, async (req, res) => {
    if (!req.body.endPage && !req.body.startPage && !req.body.roomId) {
        return res.redirect(`/room/create`);
    }
    const startPage = await util.getPagesWithRedirects(req.body.startPage);
    const endPage = await util.getPagesWithRedirects(req.body.endPage);
    room = new Room({
        roomId: req.body.roomId,
        startPage: startPage,
        endPage: endPage,
    });
    await room.save();
    res.redirect(`/room/join?id=${req.body.roomId}`);
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
        res.render(`wiki.ejs`, {
            body: new_body,
            title: resp.data.parse.title,
            userId: req.session.userId,
        });
    } catch (error) {
        res.redirect("/");
    }
});

// Route to catch some articles which have slashes in the titles
// Replaces the slash with a %2F code
router.get("/:id/wiki/:term/:term2", (req, res) => {
    res.redirect(
        `/room/${req.params.id}/wiki/${req.params.term}%2F${req.params.term2}`
    );
});

router.get("/:id/play", [roomCheck, sessionIdCheck], async (req, res) => {
    const roomId = req.params.id;
    const userId = req.session.userId;
    const room = await Room.findOne({ roomId });
    if (!room) {
        return res.redirect(`/room/join`);
    }
    return res.render(`play.ejs`, {
        userId: userId,
        roomId: roomId,
        startPage: util.toSentenceCase(room.startPage),
        endPage: util.toSentenceCase(room.endPage),
    });
});

router.get("/test", async (req, res) => {
    console.log(await util.doesPageExist("Alien (film)"));
    res.send("TEST PAGE");
});

module.exports = router;
