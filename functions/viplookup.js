const j = require("../variables/j");
const _returnerr = require("./_returnerr");

class viplookup {
    static channel = (channelID, maxnum) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ch = await j.vipinfosplitter.getKey(["channels", channelID]);
                if (!ch) return reject({ error: Error("channel not in logs") });
                let r = ch;

                if (maxnum) {
                    r.users = {};
                    Object.keys(ch.users).slice(0, j.config.api.max_num).forEach(a => {
                        r.users[a] = ch.users[a];
                    });
                };

                return resolve({
                    id: channelID,
                    num: Object.keys(ch.users).length,
                    ...ch
                });
            } catch (e) {
                return reject({ error: new Error(_returnerr(e)) });
            }
        });
    };

    static user = (userID, maxnum) => {
        return new Promise(async (resolve, reject) => {
            try {
                let us = await j.vipinfosplitter.getKey(["users", userID]);
                if (!us) return reject({ error: Error("user not in logs") });
                let r = us;

                if (maxnum) {
                    r.channels = {};
                    Object.keys(us.channels).slice(0, j.config.api.max_num).forEach(a => {
                        r.channels[a] = us.channels[a];
                    });
                };

                return resolve({
                    id: userID,
                    num: Object.keys(us.channels).length,
                    ...r
                });
            } catch (e) {
                return reject({ error: new Error(_returnerr(e)) });
            }
        });
    };
};

module.exports = viplookup;