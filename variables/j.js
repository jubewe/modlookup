const { oberknechtClient } = require("oberknecht-client");
const oberknechtUtils = require("oberknecht-utils");
const { Client: discordClient } = require("discord.js");
const { jsonsplitter } = require("@jubewe/jsonsplitter");

const env = require("dotenv").config().parsed;
const config = require("../config.json");
const express = require("express");
const _mainpath = require("../functions/_mainpath");
const _cleannumber = require("../functions/_cleannumber");

class j {
    static client = new oberknechtClient({
        token: env.T_TOKEN,
        username: env.T_USERNAME,
        prefix: config.prefix,
        saveIDs: true,
        debug: 3,
        apiStartPath: "../../data/twitch/userids",
        executeOnOutgoingPrivmsg: (m) => {
            if (m.startsWith("Error") && !m.includes("PoroSad")) m = m + " PoroSad";
            let dmatch = m.match(/(?<!\S)\d{3,}(?!\S)/g);
            if ((dmatch ?? undefined)) {
                dmatch.forEach(a => {
                    m = m.replace(new RegExp(a, "g"), _cleannumber(a));
                });
            };
            return m + " Oida";
        }
    });

    static logclient = new oberknechtClient({
        token: env.T_TOKEN
    });

    static express = express();
    static expressapi = express();
    static expresshtml = express.static(_mainpath("./express/endpoints/html"));

    static discordclient = new discordClient({
        intents: ["GuildMembers", "Guilds", "MessageContent", "DirectMessages", "GuildMessages", "GuildPresences"]
    });

    static config = config;

    static handledCache = {
        handled: {},
        handledLog: {},
        handledClient: {},
        handledDiscord: {},

        handledCommands: {},
        handledClientCommands: {},
        handledDiscordCommands: {},

        handledWebsiteRequests: {},
        handledAPIRequests: {},
        handledWebsiteEndpointRequests: {},
        handledAPIEndpointRequests: {}
    };
    
    static development_start = new Date("2023-02-17T00:00:00.000Z");

    static modinfosplitter = new jsonsplitter({ startpath: "./data/modinfo", debug: 2 });
    static vipinfosplitter = new jsonsplitter({ startpath: "./data/vipinfo", debug: 2 });

    static modules = class {
        static oberknechtClient = oberknechtClient;
        static oberknechtUtils = oberknechtUtils;
    };

    static joinedChannels = [];
};

module.exports = j;