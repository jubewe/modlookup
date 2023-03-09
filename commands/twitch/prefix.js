const j_ = require("../../classes/j_");
const j = require("../../variables/j");

module.exports = {
    name: "prefix",
    permission: j.config.perm.moderator,
    /** @param {j_} response */
    exec: async (response) => {
        let customprefix = await j.channelsplitter.getKey(["channels", response.channelID, "prefix"], true);
        if(!response.messageArguments[1]) return response.reply(`Current channel prefix: ${customprefix ?? `default: ${j.config.prefix}`}`);
        if(response.messageArguments[1] == "reset") {
            if(!customprefix) return response.reply(`Error: No custom prefix has been set for this channel`);
            await j.channelsplitter.deleteKey(["channels", response.channelID, "prefix"], true);
            return response.reply(`Successfully deleted custom prefix, the new one is from now on ${j.config.prefix}`);
        };

        if(!await j.channelsplitter.getKey(["channels", response.channelID], true)) await j.channelsplitter.addKey(["channels", response.channelID], {});
        await j.channelsplitter.editKey(["channels", response.channelID, "prefix"], response.messageArguments[1]);

        response.reply(`Successfully set channel prefix to ${response.messageArguments[1]}`);
    }
};