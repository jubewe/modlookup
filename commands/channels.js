const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "channels",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Found ${await j.modinfosplitter?.getMainKey(["channels", "num"]) ?? 0} mod-channels in the database`);
    }
};