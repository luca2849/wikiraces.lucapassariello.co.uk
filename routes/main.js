const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    req.session.destroy();
    res.render("index.ejs");
});

router.get("/policies", (req, res) => {
    res.render("policies.ejs");
});

module.exports = router;
