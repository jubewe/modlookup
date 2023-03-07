const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "help",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Commands, Website and help: https://modlookup.jubewe.de/`);
    }
};