const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const j = require("../../../variables/j");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (j.config.trackers.vips) {
        if (!response.userstate.badges["vip"] && j.vipinfosplitter.getKey(["users", response.userstate.id, "channels", response.channelID])) j.vipinfosplitter.deleteKey(["users", response.userstate.id, "channels", response.channelID]);

        if (!response.userstate.badges["vip"]) return;

        if (!j.vipinfosplitter.getKey(["users", response.userstate.id])) j.vipinfosplitter.addKey(["users", response.userstate.id], { "name": response.userstate.username, "channels": {} });
        if (!j.vipinfosplitter.getKey(["channels", response.channel.id])) j.vipinfosplitter.addKey(["channels", response.channel.id], { "name": response.channel.name, "users": {} });

        j.vipinfosplitter.editKey(["users", response.userstate.id, "channels", response.channel.id], { "name": response.channel.name });
        j.vipinfosplitter.editKey(["channels", response.channel.id, "users", response.userstate.id], { "name": response.userstate.username });
    };
};