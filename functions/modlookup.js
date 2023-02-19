const files = require("../variables/files");
const j = require("../variables/j");
let pagination;
let joinedChannels = [];
let block_channels = 0;
const max_block_channels = 3000;

class modlookup {
    static channel = (channelID) => {
        return new Promise((resolve) => {
            if (!files.modinfo.channels[channelID]) return resolve({ error: Error("channel not in logs") });

            return resolve(files.modinfo.channels[channelID]);
        });
    };

    static user = (userID) => {
        return new Promise((resolve) => {
            if (!files.modinfo.users[userID]) return resolve({ error: Error("user not in logs") });

            return resolve(files.modinfo.users[userID]);
        });
    };

    /** @param {num} num in hundred (*100) */
    static join = async (num, usePagination) => {
        return new Promise(async (resolve, reject) => {
            join();

            async function join() {
                let reqData = { first: 100, language: "de" };

                if (usePagination && pagination) reqData.after = pagination;
                await j.client.API.getStreams(reqData)
                    .then(streams => {
                        pagination = streams.pagination.cursor ?? undefined;
                        const streamLogins = streams.data.map(a => a.user_login);

                        block_channels += 100;
                        joinedChannels.push(...streamLogins);
                        j.logclient.joinAll(streamLogins);
                        if (block_channels < max_block_channels) join(); else resolve(joinedChannels);
                    })
                    .catch(reject);
            };
        });
    };

    /** @param {number} num in hundrets (*100) */
    static part = async (num) => {
        let partChannels = joinedChannels.splice(0, (num * 100));
        block_channels -= partChannels.length;
        return await j.client.partAll(partChannels);
    };

    /** @param {number} num in hundrets (*100) */
    static renew = async (num) => {
        await this.part(num);
        return await this.join(num, true);
    };
};

module.exports = modlookup;