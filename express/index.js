const rateLimit = require("express-rate-limit");
const j = require("../variables/j");
const c = require("../config.json");
const _log = require("../functions/_log");
const modlookup = require("../functions/modlookup");
const files = require("../variables/files");
const viplookup = require("../functions/viplookup");
const _rf = require("../functions/_rf");
const _mainpath = require("../functions/_mainpath");
const regex = require("oberknecht-api/lib/var/regex");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true
});

module.exports = async () => {
    j.express.use(limiter);
    j.express.use((req, res, next) => {
        res.sendWC = async (stuff, code) => {
            if (code ?? undefined) return res.json({ "error": stuff.message ?? stuff });
            return res.json({ "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };

        next();
    });

    j.express.listen(c.express.port, () => {
        _log(1, `Express connected`);
    });

    j.express.get("/", (req, res) => {
        res.send(_rf(_mainpath("./express/endpoints.html")).toString());
    });

    j.express.get("/modlookup/users", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.users).length);
    });

    j.express.get("/modlookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.channels).length);
    });

    j.express.get("/modlookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.API.getUsers(userid)
                .then(u => {
                    userid = u.data[0].id;
                });
        };

        modlookup.user(userid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                console.error(e);
                res.sendWC(e);
            })
    });

    j.express.get("/modlookup/channel/:channelid", async (req, res) => {
        let channelid = req.params.channelid;

        if (!regex.numregex().test(channelid)) {
            await j.client.API.getUsers(channelid)
                .then(u => {
                    channelid = u.data[0].id;
                });
        };

        modlookup.channel(channelid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.sendWC(e);
            })
    });


    j.express.get("/viplookup/users", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.users).length);
    });

    j.express.get("/viplookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.channels).length);
    });

    j.express.get("/viplookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.API.getUsers(userid)
                .then(u => {
                    userid = u.data[0].id;
                });
        };

        viplookup.user(userid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.sendWC(e);
            })
    });

    j.express.get("/viplookup/channel/:channelid", async (req, res) => {
        let channelid = req.params.channelid;

        if (!regex.numregex().test(channelid)) {
            await j.client.API.getUsers(channelid)
                .then(u => {
                    channelid = u.data[0].id;
                });
        };

        viplookup.channel(channelid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.sendWC(e);
            })
    });
};