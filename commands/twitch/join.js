const j_ = require("../../classes/j_");
const _returnerr = require("../../functions/_returnerr");
const files = require("../../variables/files");
const j = require("../../variables/j");

module.exports = {
    name: "join",
    permission: j.config.perm.botdefault,
    /** @param {j_} response */
    exec: async (response) => {
        let joinchan = ((response.permission.num >= j.config.perm.botdefault) ? response.messageArguments[1] : response.senderUserName);
        if (!joinchan) return response.reply(`Error: No channel to join given PoroSad`);
        joinchan = j.modules.oberknechtUtils.correctChannelName(joinchan);
        if (j.client.channels.includes(joinchan)) return response.reply(`Error: Already in channel PoroSad`);

        j.client.join(joinchan)
            .then(() => {
                if (!files.clientChannels.channels.includes(joinchan.split("#")[1])) files.clientChannels.channels.push(joinchan.split("#")[1]);

                response.reply(`VoHiYo Successfully joined ${joinchan}`);
            })
            .catch(e => {
                response.reply(`Errored: ${_returnerr(e)} PoroSad`);
            });
    },
    _tests: ["oberknaecht"]
};