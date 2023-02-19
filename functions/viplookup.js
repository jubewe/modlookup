const files = require("../variables/files");

class viplookup {
    static channel = (channelID) => {
        return new Promise((resolve) => {
            if (!files.vipinfo.channels[channelID]) return resolve({ error: Error("channel not in logs") });

            return resolve(files.vipinfo.channels[channelID]);
        });
    };

    static user = (userID) => {
        return new Promise((resolve) => {
            if (!files.vipinfo.users[userID]) return resolve({ error: Error("user not in logs") });

            return resolve(files.vipinfo.users[userID]);
        });
    };
};

module.exports = viplookup;