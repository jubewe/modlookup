const j_ = require("../../classes/j_");
const _permission = require("../../functions/_permission");
const _returnerr = require("../../functions/_returnerr");
const j = require("../../variables/j");

module.exports = {
    name: "setperm",
    permission: j.config.perm.bothigh,
    /** @param {j_} response */
    exec: async (response) => {
        if (!response.messageArguments[2]) return response.reply("Error: No user or permnum specified");

        let permuser = await j.client.getuserid(response.messageArguments[1]);
        if (!permuser?.id) return response.reply(`Error: Invalid User provided: ${_returnerr(permuser)}`);
        let permnum = response.messageArguments[2];

        _permission(1, permnum, permuser.id)
            .then(() => {
                response.reply(`VoHiYo Successfully set permission of ${permuser.login} (${permuser.id}) to ${permnum} OkayChamp`);
            })
            .catch(e => {
                response.reply(`Error: Could not set permission of ${permuser.login} (${permuser.id}) to ${permnum}: ${_returnerr(e)}`);
            });
    },
    _tests: ["testuser", ["testuser", 10], ["testuser", 60]]
};