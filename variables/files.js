const _rf = require("../functions/_rf");
const paths = require("./paths");

let files = {
    modinfo: _rf(paths.modinfo, true),
    lel: _rf(paths.lel, true),
    clientChannels: _rf(paths.clientChannels, true)
};

module.exports = files;