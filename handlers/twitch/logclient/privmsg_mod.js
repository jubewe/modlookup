const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const j = require("../../../variables/j");
const fs = require("fs");
const _mainpath = require("../../../functions/_mainpath");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (j.config.trackers.mods) {
        try {
            if (!response.userstate.isMod) {
                if (await j.modinfosplitter.getKey(["users", response.userstate.id, "channels", response.channelID], true)) await j.modinfosplitter.deleteKey(["users", response.userstate.id, "channels", response.channelID], true);
                if (await j.modinfosplitter.getKey(["channels", response.channelID, "users", response.senderUserID], true)) await j.modinfosplitter.deleteKey(["channels", response.channelID, "users", response.senderUserID], true);
                return;
            };

            if (!await j.modinfosplitter.getMainKey(["channels", "keys", response.channel.id], true)) await j.modinfosplitter.addKey(["channels", response.channel.id], { "name": response.channel.name, "users": {} });
            if (!await j.modinfosplitter.getMainKey(["users", "keys", response.userstate.id], true)) await j.modinfosplitter.addKey(["users", response.userstate.id], { "name": response.userstate.username, "channels": {} });

            await j.modinfosplitter.editKey(["channels", response.channel.id, "users", response.userstate.id], { "name": response.userstate.username });
            await j.modinfosplitter.editKey(["users", response.userstate.id, "channels", response.channel.id], { "name": response.channel.name });
        } catch (e) {
            console.error("mod", e);
            fs.appendFileSync(_mainpath("./errors.txt"), `\nMODERROR ${JSON.stringify(e.name)} ${JSON.stringify(e.message)} ${JSON.stringify(e.stack)}`);
        }
    };
};