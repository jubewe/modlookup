const j_ = require("../classes/j_");

module.exports = {
    name: "test",
    /** @param {j_} response */
    exec: async (response) => {
        response.reply("test");
    }
};