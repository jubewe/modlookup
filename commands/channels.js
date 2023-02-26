const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "channels",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Found ${j.modinfosplitter.getMainKey(["channels", "num"])} mod-channels in the database`);
    }
};