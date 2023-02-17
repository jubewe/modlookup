const files = require("../variables/files");
const j = require("../variables/j");

class modlookup {
    static channel = (channelID) => {
        return new Promise((resolve, reject) => {
            if (!files.modinfo.channels[channelID]) return resolve({ error: Error("channel not in logs") });

            return resolve(files.modinfo.channels[channelID]);
        });
    };

    static user = (userID) => {
        return new Promise((resolve, reject) => {
            if (!files.modinfo.users[userID]) return resolve({ error: Error("user not in logs") });

            return resolve(files.modinfo.users[userID]);
        });
    };
};

module.exports = modlookup;