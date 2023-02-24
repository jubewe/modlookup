const _log = require("../../functions/_log");

function logreq(req, res){
    _log(0, `${req.method}\t${req.url}`);
};

module.exports = logreq;