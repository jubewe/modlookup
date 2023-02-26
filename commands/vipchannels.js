const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "vipchannels",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Found ${j.vipinfosplitter.getMainKey(["channels", "num"])} (tracked) vip-channels in the database`);
    }
};