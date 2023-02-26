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
let handledMessagescache = j.handledMessagescache;

_log(1, `Index: Loaded packages (Took ${_cleantime(Date.now() - loadstart, 4).time.join(" and ")})`, null, "42");

if (c.connect.twitch) j.client.connect();
if (c.connect.twitch_log && (c.trackers.mods || c.trackers.vips)) j.logclient.connect();

if(c.connect.express) {
    require("./express/index")();
    require("./express/indexapi")();
};

j.client.onReady(require("./handlers/twitch/ready"));
j.logclient.onReady(require("./handlers/twitch/logclient/ready"));

j.client.onError(require("./handlers/twitch/error"));
j.logclient.onError(require("./handlers/twitch/logclient/error"));

setInterval(() => {
    const a = Object.keys(handledMessagescache).filter(a => a < (Date.now() - 60000));
    a.forEach(b => {
        delete handledMessagescache[b];
    });
}, 60000);

setInterval(() => {
    handledMessagescache[Date.now()] = files.lel.handledMessages;
}, 15000);

j.logclient.onPRIVMSG(require("./handlers/twitch/logclient/privmsg_mod"));
j.logclient.onPRIVMSG(require("./handlers/twitch/logclient/privmsg_vip"));

j.client.onPRIVMSG(require("./handlers/twitch/privmsg"));
j.client.onWHISPER(require("./handlers/twitch/whisper"));

if (c.connect.discord) j.discordclient.login(env.DC_TOKEN);

j.discordclient.on("ready", require("./handlers/discord/ready"));
j.discordclient.on("messageCreate", require("./handlers/discord/messageCreate"));

process.on("unhandledRejection", e => { console.error(e) });
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