const rateLimit = require("express-rate-limit");
const j = require("../variables/j");
const c = require("../config.json");
const _log = require("../functions/_log");
const regex = require("oberknecht-api/lib/var/regex");
const logreq = require("./functions/logreq");
const _rf = require("../functions/_rf");
const redirecthtml = require("./functions/redirecthtml");
const _mainpath = require("../functions/_mainpath");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true
});

module.exports = async () => {
    let files = require("../variables/files");
    j.express.use(limiter);
    j.express.use((req, res, next) => {
        res.sendWC = async (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return res.json({ "status": status ?? 400, "error": stuff.error.message ?? stuff.error ?? stuff });
            return res.json({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };

        logreq(req, res);

        if(!files.lel.handledRequests) files.lel.handledRequests = 0;
        files.lel.handledRequests++;

        next();
    });

    j.express.use(require("./use/default_headers"));

    j.express.use("/html", j.expresshtml);

    j.express.listen(c.express.port, () => {
        _log(1, `Express connected`);
    });

    j.express.get("/", (req, res) => {
        res.send(_rf("./express/endpoints/endpoints.html"));
    });

    j.express.get("/modlookup", (req, res) => {
        res.send(_rf("./express/endpoints/html/modlookup/index.html"));
    });

    j.express.get("/modlookup/users", (req, res) => {
        res.send(_rf("./express/endpoints/html/modlookup/users.html"));
    });

    j.express.get("/modlookup/channels", (req, res) => {
        res.send(_rf("./express/endpoints/html/modlookup/channels.html"));
    });

    j.express.get("/modlookup/user", async (req, res) => {
        res.send(_rf("./express/endpoints/html/modlookup/user.html"));
    });

    j.express.get("/modlookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.API.getUsers(userid)
                .then(u => {
                    let redirecturl = new URL(req.url, `http://${req.headers.host}`);
                    return redirecthtml(req, res, `${redirecturl.origin}${redirecturl.pathname.replace(userid, u.data[0].id)}`);
                });
        } else {
            res.send(_rf("./express/endpoints/html/modlookup/user.html"));
        }
    });

    
    j.express.get("/modlookup/channel", async (req, res) => {
        res.send(_rf("./express/endpoints/html/modlookup/channel.html"));
    });

    j.express.get("/modlookup/channel/:channelid", async (req, res) => {
        let channelid = req.params.channelid;

        if (!regex.numregex().test(channelid)) {
            await j.client.API.getUsers(channelid)
                .then(u => {
                    let redirecturl = new URL(req.url, `http://${req.headers.host}`);
                    return redirecthtml(req, res, `${redirecturl.origin}${redirecturl.pathname.replace(channelid, u.data[0].id)}`);
                });
        } else {
            res.send(_rf("./express/endpoints/html/modlookup/channel.html"));
        }
    });
    
    j.express.get("/viplookup", (req, res) => {
        res.send(_rf("./express/endpoints/html/viplookup/index.html"));
    });
    
    j.express.get("/viplookup/users", (req, res) => {
        res.send(_rf("./express/endpoints/html/viplookup/users.html"));
    });

    j.express.get("/viplookup/channels", (req, res) => {
        res.send(_rf("./express/endpoints/html/viplookup/channels.html"));
    });

    j.express.get("/viplookup/user", async (req, res) => {
        res.send(_rf("./express/endpoints/html/viplookup/user.html"));
    });

    j.express.get("/viplookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.API.getUsers(userid)
                .then(u => {
                    let redirecturl = new URL(req.url, `http://${req.headers.host}`);
                    return redirecthtml(req, res, `${redirecturl.origin}${redirecturl.pathname.replace(userid, u.data[0].id)}`);
                });
        } else {
            res.send(_rf("./express/endpoints/html/viplookup/user.html"));
        }
    });

    j.express.get("/viplookup/channel", async (req, res) => {
        res.send(_rf("./express/endpoints/html/viplookup/channel.html"));
    });

    j.express.get("/viplookup/channel/:channelid", async (req, res) => {
        let channelid = req.params.channelid;

        if (!regex.numregex().test(channelid)) {
            await j.client.API.getUsers(channelid)
                .then(u => {
                    let redirecturl = new URL(req.url, `http://${req.headers.host}`);
                    return redirecthtml(req, res, `${redirecturl.origin}${redirecturl.pathname.replace(channelid, u.data[0].id)}`);
                });
        } else {
            res.send(_rf("./express/endpoints/html/viplookup/channel.html"));
        }
    });

    // j.express.get("/validate", async (req, res) => {
    //     res.send(_rf("./express/endpoints/html/validate.html"));
    // });
};