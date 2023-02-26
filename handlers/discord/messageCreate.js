const { Message } = require("discord.js");
const j = require("../../variables/j");
const dc_commandhandler = require("./dc_commandhandler");

/** @param {Message} response */
module.exports = async (response) => {
    response.response = response;
    if (!response.content.match(new RegExp(`^${j.config.prefix}+\\w+`, "i"))) return;

    let command = response.command = response.content.split(" ")[0].split(j.config.prefix)[1];
    let permission = response.permission = { num: (response.author.bot ? 0 : 10) };
    let message = response.messageText = response.content;
    let messageArguments = response.messageArguments = response.content.split(" ");

    if (command) {
        dc_commandhandler(response);
    };
};