const express = require(`express`);
const router = express.Router();
const axios = require(`axios`);
const util = require("../util.js");
const ROOMS = require("../rooms.js");
const io = require(`../sockets.js`).getio();
const ee = require(`../eventEmiter`);
const roomCheck = require("../middleware/roomCheck");

router.get("/join", (req, res) => {
    util.log(JSON.stringify(ROOMS));
    if (!req.session.userId) {
        const userId = util.createId(10);
        req.session.userId = userId;
    }
    res.render("joinRoom.ejs", { userId: req.session.userId });
});
router.post("/join", (req, res) => {
    const roomId = req.body.roomId;
    const username = req.body.username;
    if (!(roomId in ROOMS)) {
        res.redirect(`/room/join?error=${roomId}`);
    } else {
        ee.emit("joinRoom", {
            userId: req.session.userId,
            roomId,
            username,
        });
        res.redirect(`/room/${roomId}/play`);
    }
});

router.get("/create", (req, res) => {
    res.render("createRoom.ejs");
});

router.post("/create", (req, res) => {
    if (!req.session.userId) {
        const userId = util.createId(10);
        req.session.userId = userId;
    }
    res.redirect(`/room/join?id=${req.body.roomId}`);
});

router.get("/:id/wiki/:term", async (req, res) => {
    try {
        if (!(req.session.userId in ROOMS[req.params.id].users)) {
            return res.redirect("/");
        }
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

router.get("/:id/play", roomCheck, (req, res) => {
    const roomId = req.params.id;
    const userId = req.session.userId;
    return res.render(`play.ejs`, {
        userId: userId,
        roomId: roomId,
        startPage: util.toSentenceCase(ROOMS[roomId].startPage),
        endPage: util.toSentenceCase(ROOMS[roomId].endPage),
    });
});

module.exports = router;
