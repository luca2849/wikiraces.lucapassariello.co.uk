const express = require("express");
const router = express.Router();
const accessLog = require("../middleware/accessLog");

router.get("/", accessLog, (req, res) => {
    req.session.destroy();
    res.render("index.ejs");
});

router.get("/policies", accessLog, (req, res) => {
    res.render("policies.ejs");
});

module.exports = router;
