const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const j = require("../../../variables/j");
const fs = require("fs");
const _mainpath = require("../../../functions/_mainpath");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (j.config.trackers.mods) {
        try {
            if(await j.blacklistsplitter.getKey(["users", response.channelID, "status"], true) === 0) return;
            if(await j.blacklistsplitter.getKey(["users", response.userstate.id, "status"], true) === 0) return;

            if (!response.userstate.isMod) {
                if (await j.modinfosplitter.getKey(["users", response.userstate.id, "channels", response.channelID], true)) await j.modinfosplitter.deleteKey(["users", response.userstate.id, "channels", response.channelID], true);
                if (await j.modinfosplitter.getKey(["channels", response.channelID, "users", response.senderUserID], true)) await j.modinfosplitter.deleteKey(["channels", response.channelID, "users", response.senderUserID], true);
                return;
            };

            if (!await j.modinfosplitter.getMainKey(["channels", "keys", response.channel.id], true)) await j.modinfosplitter.addKey(["channels", response.channel.id], { "users": {} });
            if (!await j.modinfosplitter.getMainKey(["users", "keys", response.userstate.id], true)) await j.modinfosplitter.addKey(["users", response.userstate.id], { "channels": {} });

            if (!await j.client?.API?.userssplitter?.getKey(["ids", response.userstate.id], true)) await j.client?.API?.userssplitter?.addKey(["ids", response.userstate.id], response.userstate.username);
            if (!await j.client?.API?.userssplitter?.getKey(["logins", response.userstate.username], true)) await j.client?.API?.userssplitter?.addKey(["logins", response.userstate.username], response.userstate.id);

            await j.modinfosplitter.editKey(["channels", response.channel.id, "users", response.userstate.id], {});
            await j.modinfosplitter.editKey(["users", response.userstate.id, "channels", response.channel.id], {});
        } catch (e) {
            console.error("mod", e);
            fs.appendFileSync(_mainpath("./errors.txt"), `\nMODERROR ${JSON.stringify(e.name)} ${JSON.stringify(e.message)} ${JSON.stringify(e.stack)}`);
        }
    };
};