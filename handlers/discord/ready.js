const { ActivityType } = require("discord.js");
const _log = require("../../functions/_log");
const j = require("../../variables/j");

module.exports = async () => {
    _log(1, `Discordclient Connected`);

    j.discordclient.user.setPresence({
        status: "idle",
        activities: {
            "name": "test",
            "type": ActivityType.Watching
        }
    });
};