const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "clearcache",
    permission: j.config.perm.bothigh,
    /** @param {j_} response */
    exec: async (response) => {
        j.handledMessagescache = {};

        response.reply(`Successfully cleared cache: handledMessagescache`);
    }
};