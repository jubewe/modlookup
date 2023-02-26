const c = require("../../config.json");
const j_ = require("../../classes/j_");
const commands = require("../../commands/discord/_");

/** @param {j_} response */
function dc_commandhandler(response){
    if(!commands[response.command]) return;
    if(response.permission?.num < (commands[response.command].permission ?? c.perm.default)) return;

    commands[response.command].exec(response);
};

module.exports = dc_commandhandler;