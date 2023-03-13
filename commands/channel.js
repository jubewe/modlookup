const j_ = require("../classes/j_");
const modlookup = require("../functions/modlookup");
let j = require("../variables/j");
const _returnerr = require("../functions/_returnerr");
const whisperMessage = require("oberknecht-client/lib/parser/WHISPER.Message");
const _url = require("../functions/_url");

module.exports = {
    name: "channel",
    /** @param {j_} response */
    exec: async (response) => {
        let _lookupchannel = (response.messageArguments[1] ?? response.channelID);
        if (!_lookupchannel) return response.reply(`Error: No channel provided`);

        await j.client.getuser(_lookupchannel)
            .then(u => {
                _lookupchannel = u;

                modlookup.channel(_lookupchannel.id)
                    .then(lookupchannel => {
                        if (lookupchannel.error) return response.reply(`Error: ${_returnerr(lookupchannel, false)}`);

                        let add = Object.keys(lookupchannel.users).map(a => { return lookupchannel.users[a].name });
                        response.reply(`Found ${add.length} (tracked) mods in `
                            + `${_lookupchannel.login}${response instanceof whisperMessage
                                ? `: ${add.slice(0, j.config.twitch.dm.max_tracker_num).join(", ")}`
                                + `${add.length > j.config.twitch.dm.max_tracker_num ? ` (First ${j.config.twitch.dm.max_tracker_num})` : ""}` : ""} `
                            + `${(response.channel_?.linksInCommands == 1 ? _url(`/modlookup/channel/${_lookupchannel.id}`) : "")}`);
                    })
                    .catch(e => {
                        response.reply(`Errored: ${_returnerr(e)}`);
                    });
            })
            .catch(e => {
                response.reply(`Error: Invalid channel provided: ${_returnerr(e)}`);
            });
    },
    _tests: ["jubewe"]
};
