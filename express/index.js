const rateLimit = require("express-rate-limit");
const j = require("../variables/j");
const c = require("../config.json");
const _log = require("../functions/_log");
const modlookup = require("../functions/modlookup");
const files = require("../variables/files");
const viplookup = require("../functions/viplookup");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: true
});

module.exports = () => {
    j.express.use(limiter);
    j.express.use((req, res, next) => {
        res.sendWC = (stuff, code) => {
            res.status(code ?? 200).send((["number", "object"].includes(typeof stuff) ? JSON.stringify(stuff) : stuff))
        };
        res.send200 = (dat) => res.sendWC(dat);
        res.send400 = (dat) => res.sendWC(dat, 400);
        next();
    });

    j.express.listen(c.express.port, () => {
        _log(1, `Express connected`);
    });

    j.express.get("/", (req, res) => {
        res.send("lol");
    });

    j.express.get("/modlookup/users", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.users).length);
    });

    j.express.get("/modlookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.modinfo.channels).length);
    });

    j.express.get("/modlookup/user/:userid", (req, res) => {
        let userid = req.params.userid;

        modlookup.user(userid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.send400(e);
            })
    });

    j.express.get("/modlookup/channel/:channelid", (req, res) => {
        let channelid = req.params.channelid;

        modlookup.channel(channelid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.send400(e);
            })
    });
    

    j.express.get("/vipookup/users", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.users).length);
    });

    j.express.get("/viplookup/channels", (req, res) => {
        res.sendWC(Object.keys(files.vipinfo.channels).length);
    });

    j.express.get("/viplookup/user/:userid", (req, res) => {
        let userid = req.params.userid;

        viplookup.user(userid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.send400(e);
            })
    });

    j.express.get("/viplookup/channel/:channelid", (req, res) => {
        let channelid = req.params.channelid;

        viplookup.channel(channelid)
            .then(a => {
                res.sendWC(a);
            })
            .catch(e => {
                res.send400(e);
            })
    });
};