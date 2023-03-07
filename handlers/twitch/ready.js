const _log = require("../../functions/_log");
const _stackname = require("../../functions/_stackname");
const files = require("../../variables/files");
const j = require("../../variables/j");

module.exports = async () => {
    _log(1, `${_stackname("client")[3]} Ready`);

    j.client.join(j.client.options.username);
    j.client.joinAll(files.clientChannels.channels);

    setTimeout(() => {
        process.exit(2);
    }, (12 * 60 * 60 * 1000));
};