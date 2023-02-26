const _mainpath = require("../functions/_mainpath")

let paths = {
    // modinfo: _mainpath("./data_old/modinfo.json"),
    // vipinfo: _mainpath("./data_old/vipinfo.json"),
    lel: _mainpath("./data/lel.json"),
    clientChannels: _mainpath("./data/clientChannels.json"),
    permissions: _mainpath("./data/permissions.json")
};

module.exports = paths;