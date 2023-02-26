const j = require("../variables/j");
const _returnerr = require("./_returnerr");

class viplookup {
    static channel = (channelID) => {
        return new Promise((resolve, reject) => {
            try {
                let ch = j.vipinfosplitter.getKey(["channels", channelID]);
                if (!ch) return reject({ error: Error("channel not in logs") });

                return resolve({
                    id: channelID,
                    ...ch
                });
            } catch (e) {
                return reject({ error: new Error(_returnerr(e)) });
            }
        });
    };

    static user = (userID) => {
        return new Promise((resolve, reject) => {
            try {
                let us = j.vipinfosplitter.getKey(["users", userID]);
                if (!us) return reject({ error: Error("user not in logs") });

                return resolve({
                    id: userID,
                    ...us
                });
            } catch (e) {
                return reject({ error: new Error(_returnerr(e)) });
            }
        });
    };
};

module.exports = viplookup;