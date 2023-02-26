const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const getuserperm = require("../../functions/getuserperm");
const _log = require("../../functions/_log");
const files = require("../../variables/files");
const commandhandler = require("./commandhandler");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (!files.clientChannels.channels.includes(response.channel.name)) return;

    if (files.clientChannels.logchannels.includes(response.channel.name)) {
        _log(0, `#${response.channel.name} ${response.userstate.username}: ${response.message.messageText}`);
    };

    let permission = response.permission = await getuserperm(response.senderUserID, response.userstate.badgesRaw.split(",")[0]?.split("/")[0]);

    if (response.command) {
        return commandhandler(response);
    };
};