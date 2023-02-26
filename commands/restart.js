const j_ = require("../classes/j_");
const _cleantime = require("../functions/_cleantime");
const j = require("../variables/j");

module.exports = {
    name: "restart",
    permission: j.config.perm.bothigh,
    /** @param {j_} response */
    exec: async (response) => {
        await response.reply(`Waiting Restarting... (Uptime: ${_cleantime(process.uptime() * 1000, 4).time.join(" and ")})`);

        await _sleep(2000);

        process.exit(0);
    }
};