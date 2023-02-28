const c = require("../../config.json");
const j_ = require("../../classes/j_");
const commands = require("../../commands/twitch/_");
const files = require("../../variables/files");

/** @param {j_} response */
function commandhandler(response) {
    if (!files.lel.handledCommands) files.lel.handledCommands = 0;
    files.lel.handledCommands++;

    if (!files.lel.handledClientCommands) files.lel.handledClientCommands = 0;
    files.lel.handledClientCommands++;

    if (!commands[response.command]) return;
    if (response.permission?.num < (commands[response.command].permission ?? c.perm.default)) return;

    commands[response.command].exec(response);
};

module.exports = commandhandler;