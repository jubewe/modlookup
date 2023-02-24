const files = require("../variables/files");

class viplookup {
    static channel = (channelID) => {
        return new Promise((resolve, reject) => {
            if (!files.vipinfo.channels[channelID]) return reject({ error: Error("channel not in logs") });

            return resolve({
                id: channelID,
                ...files.vipinfo.channels[channelID]
            });
        });
    };

    static user = (userID) => {
        return new Promise((resolve, reject) => {
            if (!files.vipinfo.users[userID]) return reject({ error: Error("user not in logs") });

            return resolve({
                id: userID,
                ...files.vipinfo.users[userID]
            });
        });
    };
};

module.exports = viplookup;