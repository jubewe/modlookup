const modlookup = require("../../../functions/modlookup");
const _log = require("../../../functions/_log");
const _stackname = require("../../../functions/_stackname");
const files = require("../../../variables/files");
const j = require("../../../variables/j");

module.exports = async () => {
    _log(1, `${_stackname("logclient")[3]} Ready`);

    if (j.config.trackers.mods || j.config.trackers.vips) {
        await modlookup.join((j.config.trackers.max_channels ?? 5000), true)
            .then(a => {
                _log(0, `${_stackname("logclient")[3]} Joined ${a.length} channels`, "42");
            });

        j.logclient.joinAll(files.clientChannels.permanentlogchannels);

        setInterval(() => {
            _log(0, `${_stackname("logclient")[3]} Currently logging ${j.logclient.channels.length} channels`, "42")
        }, 10000);

        setInterval(() => {
            modlookup.renew(3);
        }, 600000);
    };
};