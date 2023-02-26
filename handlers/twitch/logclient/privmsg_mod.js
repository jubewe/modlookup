const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const files = require("../../../variables/files");
const j = require("../../../variables/j");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    files.lel.handledMessages++;
    if (j.config.trackers.mods) {
        if (!response.userstate.isMod && j.modinfosplitter.getKey(["users", response.userstate.id, "channels", response.channelID])) j.modinfosplitter.deleteKey(["users", response.userstate.id, "channels", response.channelID]);

        if (!response.userstate.isMod) return;

        if (!j.modinfosplitter.getKey(["users", response.userstate.id])) j.modinfosplitter.addKey(["users", response.userstate.id], { "name": response.userstate.username, "channels": {} });
        if (!j.modinfosplitter.getKey(["channels", response.channel.id])) j.modinfosplitter.addKey(["channels", response.channel.id], { "name": response.channel.name, "users": {} });

        j.modinfosplitter.editKey(["users", response.userstate.id, "channels", response.channel.id], { "name": response.channel.name });
        j.modinfosplitter.editKey(["channels", response.channel.id, "users", response.userstate.id], { "name": response.userstate.username });
    };
};