const { oberknechtClient } = require("oberknecht-client");
const files = require("./files");
const env = require("dotenv").config().parsed;
const config = require("../config.json");

class j {
    static client = new oberknechtClient({
        token: env.T_TOKEN,
        username: "VoHiYo",
        prefix: config.prefix
    });

    static logclient = new oberknechtClient({
        token: env.T_TOKEN,
        anonymus: true
    });
};

module.exports = j;