const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "vipusers",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Found ${j.vipinfosplitter.getMainKey(["users", "num"])} (tracked) vips in the database`);
    }
};