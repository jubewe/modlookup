const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "chans",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Currently tracking ${j.logclient.channels.length} channels`);
    }
};