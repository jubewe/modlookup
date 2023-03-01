const j = require("../variables/j");
const os = require("os");
const _percentage = require("./_percentage");
const getHandles = require("./getHandles");
const osUtils = require("os-utils");
const _cleantime = require("./_cleantime");

async function getApiAdmin() {
    let cpuUsage = await new Promise((resolve) => { osUtils.cpuUsage(resolve) });

    let _logs = global.logs;
    let logs = {};

    Object.keys(_logs).forEach(a => {
        logs[a] = {};
        Object.keys(_logs[a]).slice((Object.keys(_logs[a]).length - 50)).forEach(b => logs[a][b] = _logs[a][b]);
    });

    let r = {
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
        "uptime": {
            "raw": {
                "os": (os.uptime() * 1000),
                "process": (process.uptime() * 1000),
                "client": j.client?.uptime ?? "-",
                "clientws": j.client?.wsUptime ?? "-",
                "logclient": j.logclient?.uptime ?? "-",
                "logclientws": j.logclient?.wsUptime ?? "-",
                "discordclient": j.discordclient?.uptime ?? "-"
            },
            "parsed": {}
        },
        "logs": logs
    };

    Object.keys(r.uptime.raw).forEach(a => {
        if (typeof r.uptime.raw[a] !== "number") return r.uptime.parsed[a] = r.uptime.raw[a];

        r.uptime.parsed[a] = _cleantime(r.uptime.raw[a], 4).time.join(", ")
    })

    return r;
};

module.exports = getApiAdmin;