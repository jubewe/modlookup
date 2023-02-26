const j_ = require("../classes/j_");
const j = require("../variables/j");

module.exports = {
    name: "eval",
    permission: j.config.perm.botdefault,
    /** @param {j_} response */
    exec: async (response) => {
        if (!response.messageArguments[1]) return response.reply(`Error: Nothing to evaluate given`);

        let evalmsg = response.messageArguments.slice(1).join(" ");

        try {
            let evalexec = await eval(`(async () => {${evalmsg}})();`)

            response.reply(`Successfully evaluated [${typeof evalexec}]: ${evalexec}`);
        } catch (e) {
            response.reply(`Error: Could not evaluate string: ${e.message}`);
        }
    }, 
    _tests: ["return 'test'", "return undefined"]
};