const modlookup = require("../../../functions/modlookup");
const _log = require("../../../functions/_log");
const j = require("../../../variables/j");

module.exports = async () => {
    _log(1, `LogClient Ready`);

    if (j.config.trackers.mods || j.config.trackers.vips) {
        await modlookup.join(30)
            .then(a => {
                console.log(`Joined ${a.length} channels`);
            });

        setInterval(() => {
            modlookup.renew(3);
        }, 600000);
    };
};