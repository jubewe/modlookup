const _log = require("../../functions/_log");
const files = require("../../variables/files");
const j = require("../../variables/j");

module.exports = async () => {
    _log(1, `Client Ready`);

    j.client.joinAll(files.clientChannels.channels);

    setInterval(() => {
        console.log(`Currently logging ${j.logclient.channels.length} channels`);
    }, 10000);

    setTimeout(() => {
        process.exit(2);
    }, (12 * 60 * 60 * 1000));
};