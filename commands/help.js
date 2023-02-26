const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "help",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply(`VoHiYo Commands and help: https://jubewe.github.io/modlookup Website: https://modlookup.jubewe.de/`);
    }
};