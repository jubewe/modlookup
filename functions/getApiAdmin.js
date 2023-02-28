const j = require("../variables/j");
const os = require("os");
const _percentage = require("./_percentage");
const getHandles = require("./getHandles");
const osUtils = require("os-utils");

async function getApiAdmin() {
    let cpuUsage = await new Promise((resolve) => { osUtils.cpuUsage(resolve) });

    return {
        "logchannels": (j.logclient?.channels?.length ?? null),
        "channels": (j.client?.channels?.length ?? null),
        "discordservers": (j.discordclient.guilds.cache.size ?? null),
        "modlookup": {
            "channels": j.modinfosplitter.getMainKey(["channels", "num"]),
            "users": j.modinfosplitter.getMainKey(["users", "num"])
        },
        "viplookup": {
            "channels": j.vipinfosplitter.getMainKey(["channels", "num"]),
            "users": j.vipinfosplitter.getMainKey(["users", "num"])
        },
        "memory": {
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
        },
        "cpu": {
            "used": cpuUsage,
            "usedpercent": (cpuUsage * 100)
        },
        "handled": getHandles(0),
        "handledSecond": getHandles(1000),
        "handledMinute": getHandles(60 * 1000),
    };
};

module.exports = getApiAdmin;