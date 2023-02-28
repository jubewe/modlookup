const { Message } = require("discord.js");
const files = require("../../variables/files");
const j = require("../../variables/j");
const dc_commandhandler = require("./dc_commandhandler");

/** @param {Message} response */
module.exports = async (response) => {
    if (!files.lel.handled) files.lel.handled = files.lel.handledMessages;
    if (!files.lel.handledDiscord) files.lel.handledDiscord = 0;
    
    files.lel.handled++;
    files.lel.handledMessages++;
    files.lel.handledDiscord++;

    response.response = response;
    if (!response.content.match(new RegExp(`^${j.config.prefix}+\\w+`, "i"))) return;

    let command = response.command = response.content.split(" ")[0].split(j.config.prefix)[1];
    let permission = response.permission = { num: (response.author.bot ? 0 : 10) };
    let message = response.messageText = response.content;
    let messageArguments = response.messageArguments = response.content.split(" ");

    if (command) {
        if (!files.lel.handledCommands) files.lel.handledCommands = 0;
        files.lel.handledCommands++;

        if (!files.lel.handledDiscordCommands) files.lel.handledDiscordCommands = 0;
        files.lel.handledDiscordCommands++;

        dc_commandhandler(response);
    };
};