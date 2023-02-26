const _rf = require("../functions/_rf");
const paths = require("./paths");

let files = {
    // modinfo: _rf(paths.modinfo, true),
    // vipinfo: _rf(paths.vipinfo, true),
    lel: _rf(paths.lel, true),
    clientChannels: _rf(paths.clientChannels, true),
    permissions: _rf(paths.permissions, true)
};

module.exports = files;