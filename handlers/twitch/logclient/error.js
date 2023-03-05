const _log = require("../../../functions/_log");

module.exports = async (e) => {
    if (e.message == "action timed out") return;
    _log(2, Error("logclient", {"cause": e}));
};