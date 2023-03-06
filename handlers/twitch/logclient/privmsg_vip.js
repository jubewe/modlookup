const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const j = require("../../../variables/j");
const fs = require("fs");
const _mainpath = require("../../../functions/_mainpath");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (j.config.trackers.vips) {
        try {
            if (!response.userstate.badges["vip"]) {
                if (await j.vipinfosplitter.getKey(["users", response.userstate.id, "channels", response.channelID], true)) await j.vipinfosplitter.deleteKey(["users", response.userstate.id, "channels", response.channelID], true);
                if (await j.vipinfosplitter.getKey(["channels", response.channelID, "users", response.userstate.id], true)) await j.vipinfosplitter.deleteKey(["channels", response.channelID, "users", response.userstate.id], true);
                return;
            };

            if (!await j.vipinfosplitter.getMainKey(["channels", "keys", response.channel.id], true)) await j.vipinfosplitter.addKey(["channels", response.channel.id], { "users": {} });
            if (!await j.vipinfosplitter.getMainKey(["users", "keys", response.userstate.id], true)) await j.vipinfosplitter.addKey(["users", response.userstate.id], { "channels": {} });

            if (!await j.client?.API?.userssplitter?.getKey(["ids", response.userstate.id], true)) await j.client?.API?.userssplitter?.addKey(["ids", response.userstate.id], response.userstate.username);
            if (!await j.client?.API?.userssplitter?.getKey(["logins", response.userstate.username], true)) await j.client?.API?.userssplitter?.addKey(["logins", response.userstate.username], response.userstate.id);

            await j.vipinfosplitter.editKey(["channels", response.channel.id, "users", response.userstate.id], {});
            await j.vipinfosplitter.editKey(["users", response.userstate.id, "channels", response.channel.id], {});
        } catch (e) {
            console.error("vip", e);
            fs.appendFileSync(_mainpath("./errors.txt"), `\n${JSON.stringify(e.message)} ${JSON.stringify(e.stack)}`);
        }
    };
};