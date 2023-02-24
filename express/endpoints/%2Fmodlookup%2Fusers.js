const files = require("../../variables/files");

/** @param {import("express").Request} req @param {import("express").Response} res @param {Boolean} ih */
module.exports = (req, res, ih) => {
    if(ih) return res.send(_rf("./html/modlookup/users.html"));

    res.sendWC(Object.keys(files.modinfo.users).length);
};