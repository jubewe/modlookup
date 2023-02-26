const j_ = require("../../classes/j_");
const getuserperm = require("../../functions/getuserperm");
const _returnerr = require("../../functions/_returnerr");
const j = require("../../variables/j");

module.exports = {
    name: "getperm",
    permission: j.config.perm.botdefault,
    /** @param {j_} response */
    exec: async (response) => {
        let permuser = {
            id: response.userstate.id,
            login: response.userstate.username
        };

        if (response.messageArguments[1]) {
            permuser = await j.client.getuserid(response.messageArguments[1]);
            if(!permuser.id) return response.reply(`Error: Invalid User provided: ${_returnerr(permuser)}`);
        };

        getuserperm(permuser.id)
            .then(a => {
                response.reply(`VoHiYo Permission of ${permuser.login} (${permuser.id}): ${a.num} (${a.name ?? "<no description>"})`);
            })
            .catch(e => {
                response.reply(`Error: Could not get permission of ${permuser}: ${_returnerr(e)}`);
            });
    },
    _tests: ["jubewe"]
};