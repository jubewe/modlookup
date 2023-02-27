const _rf = require("../../functions/_rf");
const files = require("../../variables/files");

/**@param {import("express").Request} req @param {import("express").Response} res @param {Function} next */
module.exports = (req, res, next) => {
    // function checkadminpage(){
    //     if(send_noadmin && /^\/admin/.test(req.url)){
    //         return res.send(_rf("./express/endpoints/login.html"));
    //     } 
    //     next();
    // };

    req.permission = {
        "num": 10,
        "id": undefined,
        "token": undefined,
        "_raw": undefined
    };
    if(!req.header("authorization")) return next();

    let token = req.header("authorization").replace(/^Bearer\s/i, "").toLowerCase();

    if(!files.express_auth.tokens[token]) return next();
    
    let perm = files.express_auth.tokens[token];

    req.permission = {
        "num": parseInt(files.permissions.users[perm.user_id] ?? 10),
        "id": perm.user_id,
        "token": token,
        "_raw": perm
    };

    next();
};