const files = require("../variables/files");
const j = require("../variables/j");
const _log = require("./_log");
const _returnerr = require("./_returnerr");
let pagination;
let joinedChannels = j.joinedChannels;
let block_channels = 0;
const max_block_channels = 3000;

class modlookup {
    static channel = (channelID, maxnum) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ch = await j.modinfosplitter.getKey(["channels", channelID], true);
                if (!ch) return reject({ error: Error("channel not in logs") });
                let r = { ...ch };

                if (maxnum) {
                    r.users = {};

                    await Promise.all(Object.keys(ch.users).slice(0, j.config.api.max_num).map(async a => {
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
                    ...r
                });
            } catch (e) {
                return reject({ error: new Error(_returnerr(e)) });
            };
        });
    };

    static user = (userID, maxnum) => {
        return new Promise(async (resolve, reject) => {
            try {
                let us = await j.modinfosplitter.getKey(["users", userID], true);
                if (!us) return reject({ error: Error("user not in logs") });
                let r = { ...us };
                
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

    /** @param {num} num in hundred (*100) */
    static join = async (num, usePagination) => {
        return new Promise(async (resolve, reject) => {
            join();

            async function join() {
                let reqData = { first: 100, language: ["de", "en"] };

                if (usePagination && pagination) reqData.after = pagination;
                await j.client.API.getStreams(reqData)
                    .then(streams => {
                        pagination = streams.pagination.cursor ?? undefined;
                        const streamLogins = streams.data.map(a => a.user_login);

                        block_channels += 100;
                        joinedChannels.push(...streamLogins);
                        j.logclient.joinAll(streamLogins);
                        if (block_channels < ((num * 100) ?? max_block_channels)) join(); else resolve(joinedChannels);
                    })
                    .catch(reject);

                _log(0, `>> Joined ${joinedChannels.length} channels (Bot joined: ${j.logclient.channels.length})`, "42");
            };
        });
    };

    /** @param {number} num in hundrets (*100) */
    static part = async (num) => {
        let partChannels = joinedChannels.filter(a => !files.clientChannels.permanentlogchannels.includes(a)).splice(0, (num * 100));
        block_channels -= partChannels.length;
        _log(0, `>> Parted ${partChannels.length} channels (Now in ${joinedChannels.length} channels, Bot joined: ${j.logclient.channels.length})`, "42");
        return await j.client.partAll(partChannels);
    };

    /** @param {number} num in hundrets (*100) */
    static renew = async (num) => {
        await this.part(num);
        return await this.join(num, true);
    };
};

module.exports = modlookup;