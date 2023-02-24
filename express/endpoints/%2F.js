const _rf = require("../../functions/_rf");

/** @param {import("express").Request} req @param {import("express").Response} res @param {Boolean} ih */
module.exports = (req, res, ih) => {
    return res.send(_rf("../endpoints.html"));
};