const { Message } = require("discord.js");
const c = require("../../config.json");
const commands = require("../../commands/_");

/** @param {Message} response */
function commandhandler(response){
    if(!commands[response.command]) return;
    if(response.permission?.num < (commands[response.command].permission ?? c.perm.default)) return;

    commands[response.command].exec(response);
};

module.exports = commandhandler;