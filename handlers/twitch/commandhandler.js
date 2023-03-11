const c = require("../../config.json");
const j_ = require("../../classes/j_");
const commands = require("../../commands/twitch/_");
const files = require("../../variables/files");
const j = require("../../variables/j");

/** @param {j_} response */
async function commandhandler(response) {
    if (!files.lel.handledCommands) files.lel.handledCommands = 0;
    files.lel.handledCommands++;

    if (!files.lel.handledClientCommands) files.lel.handledClientCommands = 0;
    files.lel.handledClientCommands++;

    if (!commands[response.command]) return;
    let command = commands[response.command];
    if (response.permission?.num < (command.permission ?? c.perm.default)) return;

    let commandcooldown = await j.cooldownsplitter.getKey(["channels", response.channel.id, "commands", response.command, "last"], true);
    let commandcooldownuser = await j.cooldownsplitter.getKey(["channels", response.channel.id, "commands", response.command, "users", response.userstate.id, "last"], true);

    if ((response.permission.num < j.config.perm.moderator) && (((commandcooldown ?? -1) + (command.cooldown ?? j.config.cooldown.default)) > Date.now())) return;
    if ((response.permission.num < j.config.perm.moderator) && (((commandcooldownuser ?? -1) + (command.cooldown_user ?? j.config.cooldown.user)) > Date.now())) return;

    if (response.permission.num < j.config.perm.moderator) {
        if (!await j.cooldownsplitter.getKey(["channels", response.channel.id], true)) await j.cooldownsplitter.addKey(["channels", response.channel.id], {});
        await j.cooldownsplitter.editKey(["channels", response.channel.id, "commands", response.command, "last"], Date.now());
        await j.cooldownsplitter.editKey(["channels", response.channel.id, "commands", response.command, "users", response.userstate.id, "last"], Date.now());
    }

    commands[response.command].exec(response);
};

module.exports = commandhandler;