const j_ = require("../classes/j_");
const _returnerr = require("../functions/_returnerr");
const _sleep = require("../functions/_sleep");
const j = require("../variables/j");

module.exports = {
    name: "update",
    permission: j.config.perm.bothigh,
    /** @param {j_} response */
    exec: async (response) => {
        try {
            require("child_process").execSync("git pull");

            response.reply(`Successfully pulled updates from git`);

            await _sleep(2000);

            require("child_process").execSync("pm2 restart modlookup");
        } catch (e) {
            response.reply(`Error: Could not execute command: ${_returnerr(e)}`);
        };
    }
};