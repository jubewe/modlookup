const j = require("../variables/j");
const c = require("../config.json");
const _log = require("../functions/_log");
const regex = require("oberknecht-api/lib/variables/regex");
const logreq = require("./functions/logreq");
const _rf = require("../functions/_rf");
const redirecthtml = require("./functions/redirecthtml");

module.exports = async () => {
    let files = require("../variables/files");
    j.express.use((req, res, next) => {
        res.sendWC = async (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return res.json({ "status": status ?? 400, "error": stuff.error.message ?? stuff.error ?? stuff });
            return res.json({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) });
        };

        logreq(req, res);

        if (!files.lel.handledWebsiteRequests) files.lel.handledWebsiteRequests = 0;
        files.lel.handledWebsiteRequests++;

        if (!files.lel.handledWebsiteEndpointRequests) files.lel.handledWebsiteEndpointRequests = {};
        if (!files.lel.handledWebsiteEndpointRequests[req.path]) files.lel.handledWebsiteEndpointRequests[req.path] = 0;
        files.lel.handledWebsiteEndpointRequests[req.path]++;

        next();
    });

    j.express.use(require("./use/default_headers"));
    j.express.use(require("./use/req_perm"));

    j.express.use("/html", j.expresshtml);

    j.express.listen(c.express.port, () => {
        _log(1, `Express connected`);
    });

    j.express.get("/", (req, res) => {
        res.send(_rf("./express/endpoints/index.html"));
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

        return res.send(_rf("./express/endpoints/html/modlookup/user.html"));
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

        return res.send(_rf("./express/endpoints/html/modlookup/channel.html"));
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

        return res.send(_rf("./express/endpoints/html/viplookup/user.html"));
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

        return res.send(_rf("./express/endpoints/html/viplookup/channel.html"));
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

    j.express.get("/dashboard", (req, res) => {
        res.send(_rf("./express/endpoints/dashboard.html"));
    });

    j.express.get("/suggestchannel", async (req, res) => {
        res.send(_rf("./express/endpoints/html/suggestchannel.html"));
    });

    j.express.get("/token/validate", async (req, res) => {
        res.send(_rf("./express/endpoints/html/validatetoken.html"));
    });

    j.express.get("/admin", async (req, res) => {
        res.send(_rf("./express/endpoints/html/admin.html"));
    });
    
    j.express.get("/admin/blacklist", async (req, res) => {
        res.send(_rf("./express/endpoints/html/admin_blacklist.html"));
    });
};