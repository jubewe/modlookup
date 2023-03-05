const _rf = require("../functions/_rf");
const paths = require("./paths");

let files = {
    lel: _rf(paths.lel, true),
    clientChannels: _rf(paths.clientChannels, true),
    permissions: _rf(paths.permissions, true),
    express_auth: _rf(paths.express_auth, true),
    suggestedchannels: _rf(paths.suggestedchannels, true)
};

module.exports = files;