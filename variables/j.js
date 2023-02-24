const { oberknechtClient } = require("oberknecht-client");
const env = require("dotenv").config().parsed;
const config = require("../config.json");
const _numberspacer = require("../functions/_numberspacer");
const express = require("express");
const _mainpath = require("../functions/_mainpath");

class j {
    static client = new oberknechtClient({
        token: env.T_TOKEN,
        username: env.T_USERNAME,
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

    static express = express();
    static expressapi = express();
    static expresshtml = express.static(_mainpath("./express/endpoints/html"));
};

module.exports = j;