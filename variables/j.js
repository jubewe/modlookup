const { oberknechtClient } = require("oberknecht-client");
const env = require("dotenv").config().parsed;
const config = require("../config.json");
const _numberspacer = require("../functions/_numberspacer");

class j {
    static client = new oberknechtClient({
        token: env.T_TOKEN,
        username: "VoHiYo",
        prefix: config.prefix,
        executeOnOutgoingPrivmsg: (m) => {
            let dmatch = m.match(/\d{3,}/g);
            if ((dmatch ?? undefined)) {
                dmatch.forEach(a => {
                    m = m.replace(new RegExp(a, "g"), _numberspacer(a));
                });
            };
            return m + " Oida";
        }
    });

    static logclient = new oberknechtClient({
        token: env.T_TOKEN,
        anonymus: true
    });
};

module.exports = j;