const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const getuserperm = require("../../functions/getuserperm");
const _log = require("../../functions/_log");
const files = require("../../variables/files");
const j = require("../../variables/j");
const commandhandler = require("./commandhandler");
const regexescape = require("regex-escape");

/** @param {privmsgMessage} response */
module.exports = async (response) => {
    if (!files.clientChannels.channels.includes(response.channel.name)) return;
    if (files.clientChannels.logchannels.includes(response.channel.name)) _log(0, `#${response.channel.name} ${response.userstate.username}: ${response.message.messageText}`);

    let channel_ = response.channel_ = await j.channelsplitter.getKey(["channels", response.channelID], true);
    let prefix = (channel_?.prefix ?? j.config.prefix);
    let command = response.messageText.match(new RegExp(`(?<=^${regexescape(prefix)})\\w+`))?.[0];
    let command_ = response.messageText.match(new RegExp(`(?<=^${regexescape(j.config.prefix)})(prefix)+`))?.[0];
    
    response.command_ = response.command;
    response.command = (command ?? command_);

    let permission = response.permission = await getuserperm(response.senderUserID, response.userstate.badgesRaw.split(",")[0]?.split("/")[0]);
    if (response.command || new RegExp(`^${regexescape(j.config.prefix)}+(prefix)+`).test(response.messageText)) return commandhandler(response);
};