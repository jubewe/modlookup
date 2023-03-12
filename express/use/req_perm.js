const files = require("../../variables/files");
const validatetoken = require("../../functions/validatetoken");

/**@param {import("express").Request} req @param {import("express").Response} res @param {Function} next */
module.exports = async (req, res, next) => {
    req.permission = {
        "num": 10,
    };

    if (!req.headers["auth"]) return next();

    let auth = JSON.parse(req.headers["auth"]);
    let token = auth.token;
    let perm = files.express_auth.tokens[token];

    if (!perm) {
        await validatetoken(token)
            .then(dat => {
                req.auth = dat;
            })
            .catch(e => {
                return res.send(JSON.stringify({ error: e }));
            });

        return next();
    } else {
        req.auth = {
            ...perm,
            token: token
        };
    };

    req.permission = {
        num: parseInt(files.permissions.users[perm.user_id] ?? 10),
        id: perm.user_id,
        login: perm.login,
        token: token,
        _raw: perm
    };

    next();
};