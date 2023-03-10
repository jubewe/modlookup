const _log = require("./functions/_log");
let loadstart = Date.now();
_log(1, `Index: Loading`, null, "42");

require("./handlers/_")();

const j = require("./variables/j");
const files = require("./variables/files");
const _cleantime = require("./functions/_cleantime");
const c = require("./config.json");
const _discordembed = require("./functions/_discordembed");
const env = require("dotenv").config().parsed;
const os = require("os");
const osUtils = require("os-utils");
const _percentage = require("./functions/_percentage");

_log(1, `Index: Loaded packages (Took ${_cleantime(Date.now() - loadstart, 4).time.join(" and ")})`, null, "42");

if (c.connect.express) {
    require("./express/index")();
    require("./express/indexapi")();
};

if (c.connect.twitch) {
    j.client.connect();

    j.client.on("_all", () => {
        if (!files.lel.handledClient) files.lel.handledClient = 0;

        files.lel.handled++;
        files.lel.handledClient++;
    });

    j.client.onReady(require("./handlers/twitch/ready"));
    j.client.onError(require("./handlers/twitch/error"));

    j.client.onPRIVMSG(require("./handlers/twitch/privmsg"));
    j.client.onWHISPER(require("./handlers/twitch/whisper"));
};

if (c.connect.twitch_log && (c.trackers.mods || c.trackers.vips)) {
    j.logclient.connect();

    j.logclient.on("_all", () => {
        if (!files.lel.handledLog) files.lel.handledLog = files.lel.handledMessages;

        files.lel.handled++;
        files.lel.handledLog++;
    });

    j.logclient.onReady(require("./handlers/twitch/logclient/ready"));
    j.logclient.onError(require("./handlers/twitch/logclient/error"));

    j.logclient.onPRIVMSG(require("./handlers/twitch/logclient/privmsg_mod"));
    j.logclient.onPRIVMSG(require("./handlers/twitch/logclient/privmsg_vip"));
};

if (c.connect.discord) {
    j.discordclient.login(env.DC_TOKEN);

    j.discordclient.on("ready", require("./handlers/discord/ready"));
    j.discordclient.on("messageCreate", require("./handlers/discord/messageCreate"));
};

if (j.modinfosplitter) { j.modinfosplitter.onError(e => { }); };
if (j.vipinfosplitter) { j.vipinfosplitter.onError(e => { }); };

setInterval(() => {
    Object.keys(j.handledCache).forEach(cache => {
        const a = Object.keys(j.handledCache[cache]).filter(b => b < (Date.now() - 60000));
        a.forEach(b => { delete j.handledCache[cache][b]; });
    });

    Object.keys(global.logs).forEach(a => {
        Object.keys(global.logs[a]).slice(0, ((Object.keys(global.logs[a]).length >= 100 ? (Object.keys(global.logs[a]).length - 100) : 0))).forEach(b => {
            delete global.logs[a][b];
        });
    });
}, 60000);

setInterval(() => {
    let d = Date.now();

    j.handledCache.handled[d] = (files.lel.handled ?? 0);
    j.handledCache.handledLog[d] = (files.lel.handledLog ?? 0);
    j.handledCache.handledClient[d] = (files.lel.handledClient ?? 0);
    j.handledCache.handledDiscord[d] = (files.lel.handledDiscord ?? 0);

    j.handledCache.handledCommands[d] = (files.lel.handledCommands ?? 0);
    j.handledCache.handledClientCommands[d] = (files.lel.handledClientCommands ?? 0);
    j.handledCache.handledDiscordCommands[d] = (files.lel.handledDiscordCommands ?? 0);

    j.handledCache.handledWebsiteRequests[d] = (files.lel.handledWebsiteRequests ?? 0);
    j.handledCache.handledAPIRequests[d] = (files.lel.handledAPIRequests ?? 0);

    j.handledCache.handledAPIEndpointRequests = {};
    j.handledCache.handledWebsiteEndpointRequests = {};

    if (files.lel.handledAPIEndpointRequests) {
        Object.keys(j.handledCache.handledAPIEndpointRequests).forEach(a => {
            if (!j.handledCache.handledAPIEndpointRequests[a]) j.handledCache.handledAPIEndpointRequests[a] = {};
            j.handledCache.handledAPIEndpointRequests[a][d] = (files.lel.handledAPIEndpointRequests[a] ?? 0);
        });
    };

    if (files.lel.handledWebsiteEndpointRequests) {
        Object.keys(j.handledCache.handledWebsiteEndpointRequests).forEach(a => {
            if (!j.handledCache.handledWebsiteEndpointRequests[a]) j.handledCache.handledWebsiteEndpointRequests[a] = {};
            j.handledCache.handledWebsiteEndpointRequests[a][d] = (files.lel.handledWebsiteEndpointRequests[a] ?? 0);
        });
    };

    new Promise((resolve) => { osUtils.cpuUsage(resolve) })
        .then(cpuUsage => {
            j.systeminfo.cpu = {
                "used": cpuUsage,
                "usedpercent": (cpuUsage * 100)
            };

            j.systeminfo.memory = {
                "os": {
                    "free": os.freemem(),
                    "total": os.totalmem(),
                    "used": (os.totalmem() - os.freemem()),
                    "usedpercent": _percentage(os.totalmem(), (os.totalmem() - os.freemem())),
                    "freepercent": _percentage(os.totalmem(), os.freemem())
                },
                "process": {
                    "free": process.memoryUsage.rss(),
                    "total": os.totalmem(),
                    "used": (os.totalmem() - process.memoryUsage.rss()),
                    "usedpercent": _percentage(os.totalmem(), (os.totalmem() - process.memoryUsage.rss()))
                }
            };

            j.systeminfo.uptime = {
                "os": (os.uptime() * 1000),
                "process": (process.uptime() * 1000),
                "client": j.client?.uptime ?? "-",
                "clientws": j.client?.wsUptime ?? "-",
                "logclient": j.logclient?.uptime ?? "-",
                "logclientws": j.logclient?.wsUptime ?? "-",
                "discordclient": j.discordclient?.uptime ?? "-"
            };
        })
}, 1000);

process.on("unhandledRejection", e => {
    console.error(e);
});

process.on("uncaughtException", e => {
    console.error(e);

    if (c.connect.discord) {
        j.discordclient.channels.cache.get(j.config.discord.channels.errorlog).send({
            embeds: [
                new _discordembed(undefined, `Error:\n\`\`\`${e.stack}\`\`\``)
            ]
        })
    };
});