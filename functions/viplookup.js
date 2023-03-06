const j = require("../variables/j");
const _returnerr = require("./_returnerr");

class viplookup {
    static channel = (channelID, maxnum) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ch = await j.vipinfosplitter.getKey(["channels", channelID], true);
                if (!ch) return reject({ error: Error("channel not in logs") });
                let r = ch;

                if (maxnum) {
                    r.users = {};
                    
                    await Promise.all(Object.keys(us.channels).slice(0, j.config.api.max_num).map(async a => {
                        return await j.client?.getusername(a)
                            .then(b => {
                                r.users[a] = {
                                    id: a,
                                    name: b,
                                    ...ch.users[a]
                                };
                            });
                    }));
                };

                return resolve({
                    id: channelID,
                    name: await j.client?.getusername(channelID),
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
                let us = await j.vipinfosplitter.getKey(["users", userID], true);
                if (!us) return reject({ error: Error("user not in logs") });
                let r = us;

                if (maxnum) {
                    r.channels = {};
                    
                    await Promise.all(Object.keys(us.channels).slice(0, j.config.api.max_num).map(async a => {
                        return await j.client?.getusername(a)
                            .then(b => {
                                r.channels[a] = {
                                    id: a,
                                    name: b,
                                    ...us.channels[a]
                                };
                            });
                    }));
                };

                return resolve({
                    id: userID,
                    name: await j.client?.getusername(userID),
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