const _mainpath = require("../functions/_mainpath")

let paths = {
    modinfo: _mainpath("./data/modinfo.json"),
    lel: _mainpath("./data/lel.json"),
    clientChannels: _mainpath("./data/clientChannels.json")
};

module.exports = paths;