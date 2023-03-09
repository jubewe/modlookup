const j_ = require("../../classes/j_");
const _returnerr = require("../../functions/_returnerr");
const j = require("../../variables/j");

module.exports = {
    name: "islogged",
    permission: j.config.perm.botdefault,
    /** @param {j_} response */
    exec: async (response) => {
        if (!response.messageArguments[1]) return response.reply(`Error: No channel specified`);

        let channel_ = response.messageArguments[1];

        await j.client.getuser(channel_)
            .then(channel => {
                response.reply(`Channel is ${j.logclient.channels.includes(channel.login) ? "" : "not "}being logged`);
            })
            .catch(e => {
                response.reply(`Error: Could not get user: ${_returnerr(e)}`);
            });
    }
};