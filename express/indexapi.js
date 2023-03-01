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
const request = require("request");
const getApiAdmin = require("../functions/getApiAdmin");
let limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: true,
    max: 50,
    skip: (req, res) => (req.permission?.num >= j.config.perm.bothigh)
});

module.exports = async () => {
    j.expressapi.use((req, res, next) => {
        res.sendWC = async (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return res.json({ "status": status ?? 400, "error": stuff.error.message ?? stuff.error ?? stuff });
            return res.json({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };

        if (!files.lel.handledAPIRequests) files.lel.handledAPIRequests = 0;
        files.lel.handledAPIRequests++;

        if(!files.lel.handledAPIEndpointRequests) files.lel.handledAPIEndpointRequests = {};
        if(!files.lel.handledAPIEndpointRequests[req.path]) files.lel.handledAPIEndpointRequests[req.path] = 0;
        files.lel.handledAPIEndpointRequests[req.path]++;

        next();
    });

    j.expressapi.use(require("./use/default_headers"));
    j.expressapi.use(require("./use/req_perm"));

    j.expressapi.use(limiter);

    j.expressapi.use("/html", j.expresshtml);

    j.expressapi.listen(c.express.api.port, () => { _log(1, `Express API connected`); });

    j.expressapi.get("/", (req, res) => { res.send(_rf(_mainpath("./express/endpoints/endpoints.html"))); });
    j.expressapi.get("/modlookup", (req, res) => { res.sendWC({ "users": j.modinfosplitter.getMainKey(["users", "num"]), "channels": j.modinfosplitter.getMainKey(["channels", "num"]) }); });
    j.expressapi.get("/modlookup/users", (req, res) => { res.sendWC(j.modinfosplitter.getMainKey(["users", "num"])); });
    j.expressapi.get("/modlookup/channels", (req, res) => { res.sendWC(j.modinfosplitter.getMainKey(["channels", "num"])); });
    j.expressapi.get("/modlookup/user/:userid", async (req, res) => {
        let userid = req.params.userid;

        if (!regex.numregex().test(userid)) {
            console.log(userid)
            await j.client.getuser(userid)
                .then(u => {
                    userid = u.id;
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
            await j.client.getuser(channelid)
                .then(u => {
                    channelid = u.id;
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

    j.expressapi.get("/viplookup", (req, res) => { res.sendWC({ "users": Object.keys(files.vipinfo.users).length, "channels": Object.keys(files.vipinfo.channels).length }); });
    j.expressapi.get("/viplookup/users", (req, res) => { res.sendWC(j.vipinfosplitter.getMainKey(["users", "num"])); });
    j.expressapi.get("/viplookup/channels", (req, res) => { res.sendWC(j.vipinfosplitter.getMainKey(["channels", "num"])); });
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
    j.expressapi.get("/validate", async (req, res) => {
        if (!req.header("authorization")) return res.sendWC({ error: Error("header authorization required") });

        let token = req.header("authorization").replace(/^Bearer\s/, "").toLowerCase();

        request(`https://id.twitch.tv/oauth2/validate`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }, (e, r) => {
            if (e || (r.statusCode !== 200)) return res.sendWC({ error: Error(e ?? r.body) });

            let dat = JSON.parse(r.body);

            files.express_auth.tokens[token] = dat;
            files.express_auth.ids[dat.user_id] = token;
            return res.sendWC(dat);
        });
    });
    j.expressapi.get("/admin", async (req, res) => {
        if ((req.permission?.num ?? 10) < j.config.perm.bothigh) return res.sendWC({ error: Error("no permission") }, 401);

        let apiadmin = await getApiAdmin();
        res.sendWC(apiadmin);
    });
};