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
const express = require("express");
const path = require("path");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true
});

module.exports = async () => {
    j.expressapi.use(limiter);
    j.expressapi.use((req, res, next) => {
        res.sendWC = async (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return res.json({ "status": status ?? 400, "error": stuff.error.message ?? stuff.error ?? stuff });
            return res.json({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };
        
        if(!files.lel.handledAPIRequests) files.lel.handledAPIRequests = 0;
        files.lel.handledAPIRequests++;

        next();
    });

    j.expressapi.use(require("./use/default_headers"));

    j.expressapi.use("/html", j.expresshtml);

    j.expressapi.listen(c.express.api.port, () => {
        _log(1, `Express API connected`);
    });

    j.expressapi.get("/", (req, res) => {
        res.send(_rf(_mainpath("./express/endpoints/endpoints.html")).toString());
    });

    j.expressapi.get("/modlookup", (req, res) => {
        res.sendWC({ "users": Object.keys(files.modinfo.users).length, "channels": Object.keys(files.modinfo.channels).length });
    });

    j.expressapi.get("/modlookup/users", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.users).length);
    });

    j.expressapi.get("/modlookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.channels).length);
    });

    j.expressapi.get("/modlookup/user/:userid", async (req, res) => {
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

    j.expressapi.get("/modlookup/channel/:channelid", async (req, res) => {
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


    j.expressapi.get("/viplookup", (req, res) => {
        res.sendWC({ "users": Object.keys(files.vipinfo.users).length, "channels": Object.keys(files.vipinfo.channels).length });
    });

    j.expressapi.get("/viplookup/users", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.users).length);
    });

    j.expressapi.get("/viplookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.channels).length);
    });

    j.expressapi.get("/viplookup/user/:userid", async (req, res) => {
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
                res.sendWC(e, 400);
            })
    });

    j.expressapi.get("/viplookup/channel/:channelid", async (req, res) => {
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
                res.sendWC(e, 400);
            })
    });
};