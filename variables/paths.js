const _mainpath = require("../functions/_mainpath")

let paths = {
    lel: _mainpath("./data/lel.json"),
    clientChannels: _mainpath("./data/clientChannels.json"),
    permissions: _mainpath("./data/permissions.json"),
    express_auth: _mainpath("./data/express/auth.json"),
    suggestedchannels: _mainpath("./data/suggestedchannels.json")
};

module.exports = paths;