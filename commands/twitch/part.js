const j_ = require("../../classes/j_");
const _returnerr = require("../../functions/_returnerr");
const files = require("../../variables/files");
const j = require("../../variables/j");

module.exports = {
    name: "part",
    permission: j.config.perm.botdefault,
    /** @param {j_} response */
    exec: async (response) => {
        let partchan = ((response.permission.num >= j.config.perm.botdefault) ? response.messageArguments[1] : response.senderUserName);
        if (!partchan) return response.reply(`Error: No channel to part given PoroSad`);
        partchan = j.modules.oberknechtUtils.correctChannelName(partchan);
        if (!j.client.channels.includes(partchan)) return response.reply(`Error: Not in channel PoroSad`);

        j.client.part(partchan)
            .then(() => {
                if (files.clientChannels.channels.includes(partchan.split("#")[1])) files.clientChannels.channels.splice(files.clientChannels.channels.indexOf(partchan.split("#")[1]), 1);

                response.reply(`VoHiYo Successfully parted channel`);
            })
            .catch(e => {
                response.reply(`Errored: ${_returnerr(e)} PoroSad`);
            });
    },
    _tests: ["oberknaecht"]
};