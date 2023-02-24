const _rf = require("../../functions/_rf");
const files = require("../../variables/files");

/** @param {import("express").Request} req @param {import("express").Response} res @param {Boolean} ih */
module.exports = (req, res, ih) => {
    if(ih) return res.send(_rf("./html/modlookup/channels.html"));

    res.sendWC(Object.keys(files.modinfo.channels).length);
};