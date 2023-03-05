const { rateLimit } = require("express-rate-limit");
const j = require("../variables/j");
const c = require("../config.json");
const _log = require("../functions/_log");
const modlookup = require("../functions/modlookup");
const files = require("../variables/files");
const viplookup = require("../functions/viplookup");
const _rf = require("../functions/_rf");
const _mainpath = require("../functions/_mainpath");
const regex = require("oberknecht-api/lib/var/regex");
const getApiAdmin = require("../functions/getApiAdmin");
const validatetoken = require("../functions/validatetoken");
const revoketoken = require("../functions/revoketoken");
const _returnerr = require("../functions/_returnerr");
const suggestchannelStatusname = require("../functions/_suggestchannel.statusname");
const _stackname = require("../functions/_stackname");

const limiter = rateLimit({
    windowMs: (5 * 60 * 1000),
    standardHeaders: true,
    legacyHeaders: true,
    max: 100,
    skip: (req, res) => req.permission?.num >= j.config.perm.bothigh
});

module.exports = async () => {
    j.expressapi.use((req, res, next) => {
        res.sendWC = async (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return res.json({ "status": status ?? 400, "error": stuff.error.message ?? stuff.error ?? stuff });
            return res.json({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };

        if (!files.lel.handledAPIRequests) files.lel.handledAPIRequests = 0;
        files.lel.handledAPIRequests++;

        if (!files.lel.handledAPIEndpointRequests) files.lel.handledAPIEndpointRequests = {};
        if (!files.lel.handledAPIEndpointRequests[req.path]) files.lel.handledAPIEndpointRequests[req.path] = 0;
        files.lel.handledAPIEndpointRequests[req.path]++;

        next();
    });

    j.expressapi.use(require("./use/default_headers"));
    j.expressapi.use(require("./use/req_perm"));
    
    j.expressapi.use(limiter);
    j.expressapi.use((req, res, next) => {
        _log(0, `${_stackname("api")[3]} ${req.method} ${req.path}`);
        next();
    });
    
    j.expressapi.use("/html", j.expresshtml);

    j.expressapi.listen(c.express.api.port, () => { _log(1, `Express API connected`); });

    j.expressapi.get("/", (req, res) => { res.send(_rf(_mainpath("./express/endpoints/endpoints.html"))); });
    j.expressapi.get("/modlookup", async (req, res) => { res.sendWC({ "users": await j.modinfosplitter.getMainKey(["users", "num"]), "channels": await j.modinfosplitter.getMainKey(["channels", "num"]) }); });
    j.expressapi.get("/modlookup/users", async (req, res) => { res.sendWC(await j.modinfosplitter.getMainKey(["users", "num"])); });
    j.expressapi.get("/modlookup/channels", async (req, res) => { res.sendWC(await j.modinfosplitter.getMainKey(["channels", "num"])); });
    j.expressapi.get("/modlookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.getuser(userid)
                .then(u => {
                    userid = u.id;
                });
        };

        modlookup.user(userid, true)
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
            await j.client.getuser(channelid)
                .then(u => {
                    channelid = u.id;
                });
        };

        modlookup.channel(channelid, true)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.sendWC(e);
            })
    });

    j.expressapi.get("/viplookup", async (req, res) => { res.sendWC({ "users": await j.vipinfosplitter.getMainKey(["users", "num"]), "channels": await j.vipinfosplitter.getMainKey(["channels", "num"]) }); });
    j.expressapi.get("/viplookup/users", async (req, res) => { res.sendWC(await j.vipinfosplitter.getMainKey(["users", "num"])); });
    j.expressapi.get("/viplookup/channels", async (req, res) => { res.sendWC(await j.vipinfosplitter.getMainKey(["channels", "num"])); });
    j.expressapi.get("/viplookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            await j.client.getuser(userid)
                .then(u => {
                    userid = u.id;
                })
                .catch(e => {
                    res.sendWC(e, 400);
                })
        };

        viplookup.user(userid, true)
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

        viplookup.channel(channelid, true)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.sendWC(e, 400);
            })
    });

    j.expressapi.get("/suggestchannel", (req, res) => {
        if (!req.auth) return res.sendWC({ error: Error("login required") });

        let isadmin = ((req.permission?.num ?? 10) >= j.config.perm.bothigh);

        let suggestedchannels = {};
        if (isadmin) {
            Object.keys(files.suggestedchannels.channels)
                .filter(a => files.suggestedchannels.channels[a].status === 0)
                .forEach(a => {
                    let suggestedchannel = files.suggestedchannels.channels[a];
                    let b = {
                        ...suggestedchannel,
                        "status_name": suggestchannelStatusname(suggestedchannel.status)
                    };

                    suggestedchannels[a] = b;
                });
        } else {
            (files.suggestedchannels.users?.[req.auth?.user_id]?.channels ?? [])
                .forEach(a => {
                    let suggestedchannel = files.suggestedchannels.channels[a];
                    let b = {
                        ...suggestedchannel,
                        "status_name": suggestchannelStatusname(suggestedchannel.status)
                    };

                    delete b.users;

                    suggestedchannels[a] = b;
                });
        };

        res.sendWC({ "suggestedchannels": suggestedchannels, "isAdmin": isadmin });
    });

    j.expressapi.post("/suggestchannel", (req, res) => {
        if (!req.auth) return res.sendWC({ error: Error("login required") });
        if (!req.headers["suggestchannel"]) return res.sendWC({ error: Error("header suggestchannel required") });

        let suggestedchannel_ = req.headers["suggestchannel"];

        j.client.getuser(suggestedchannel_)
            .then(suggestedchannel => {
                // status: 0 = pending, 1 = approved, 2 = denied
                if (!files.suggestedchannels.channels[suggestedchannel.id]) files.suggestedchannels.channels[suggestedchannel.id] = { "_user": suggestedchannel, "status": 0, "users": [] };

                if (files.suggestedchannels.channels[suggestedchannel.id].status > 0) return res.sendWC({ error: Error(`channel has already been suggested (${suggestchannelStatusname(files.suggestedchannels.channels[suggestedchannel.id].status)})`) })
                if (files.suggestedchannels.channels[suggestedchannel.id].users.includes(req.auth.user_id)) return res.sendWC({ error: Error("you have already suggested that channel") });
                files.suggestedchannels.channels[suggestedchannel.id].users.push(req.auth.user_id);
                if (!files.suggestedchannels.users[req.auth.user_id]) files.suggestedchannels.users[req.auth.user_id] = { "channels": [] };
                files.suggestedchannels.users[req.auth.user_id].channels.push(suggestedchannel.id);

                if (j.config.connect.twitch_log) {
                    j.logclient?.join(suggestedchannel.login)
                        .then(() => {
                            j.joinedChannels.push(suggestedchannel.login);
                        });
                };


                res.sendWC({
                    "suggestedchannel": {
                        "_user": suggestedchannel,
                        "status_name": suggestchannelStatusname(suggestedchannel.status)
                    }
                });
            })
            .catch(e => {
                return res.sendWC({ error: Error("could not request suggested channel") });
            })
    });

    j.expressapi.patch("/suggestchannel", async (req, res) => {
        if ((req.permission?.num ?? 10) < j.config.perm.bothigh) return res.sendWC({ error: Error("no permission") }, 401);
        if (!req.headers["suggestchannel"]) return res.sendWC({ error: Error("header suggestchannel required") });
        if (!req.headers["suggestchannel_status"]) return res.sendWC({ error: Error("header suggestchannel_status required") });

        let suggestchannel = req.headers["suggestchannel"];
        let suggestchannel_status = req.headers["suggestchannel_status"];

        if (!regex.numregex().test(suggestchannel_status)) return res.sendWC({ error: Error("header suggestchannel_status must be a number") });
        suggestchannel_status = parseInt(suggestchannel_status);

        if (!files.suggestedchannels.channels[suggestchannel]) return res.sendWC({ error: Error("channel not in file") });
        files.suggestedchannels.channels[suggestchannel].status = suggestchannel_status;

        switch (suggestchannel_status) {
            case 1: {
                let suggestchannelname = files.suggestedchannels.channels[suggestchannel]?._user?.login;

                if (!suggestchannelname) return res.sendWC({ error: Error("channel not in file") }, 500);

                files.clientChannels.permanentlogchannels.push(suggestchannelname);

                break;
            };

            case 2: {
                let suggestchannelname = files.suggestedchannels.channels[suggestchannel]?._user?.login;

                if (!suggestchannelname) return res.sendWC({ error: Error("channel not in file") }, 500);

                if (files.clientChannels.permanentlogchannels.includes(suggestchannelname)) files.clientChannels.permanentlogchannels.splice(files.clientChannels.permanentlogchannels.indexOf(suggestchannelname), 1);

                break;
            };
        };

        res.sendWC("Successful");
    });

    j.expressapi.all("/validatetoken", async (req, res) => {
        if (!req.headers["authorization"]) return res.sendWC({ error: Error("header authorization required") });

        let token = req.headers["authorization"].replace(/^Bearer\s/i, "").toLowerCase();

        await validatetoken(token)
            .then(dat => {
                res.sendWC(dat);
            })
            .catch(e => {
                res.sendWC({ error: _returnerr(e) });
            })
    });

    j.expressapi.all("/revoketoken", async (req, res) => {
        if (!req.headers["auth"]) return res.sendWC({ error: Error("header auth required") });
        if (!regex.jsonreg().test(req.headers["auth"])) return res.sendWC({ error: Error("header auth does not match json regex") });

        let auth = req.headers["auth"];

        await revoketoken(auth.token, auth.client_id, auth.user_id)
            .then(() => {
                res.sendWC();
            })
            .catch(e => {
                res.sendWC({ error: _returnerr(e) });
            })
    });

    j.expressapi.get("/admin", async (req, res) => {
        if ((req.permission?.num ?? 10) < j.config.perm.bothigh) return res.sendWC({ error: Error("no permission") }, 401);

        let apiadmin = await getApiAdmin();
        res.sendWC(apiadmin);
    });
};