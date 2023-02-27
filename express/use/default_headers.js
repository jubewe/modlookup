/**@param {import("express").Request} req @param {import("express").Response} res @param {Function} next */
module.exports = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("j_timestamp", Date.now());

    next();
};