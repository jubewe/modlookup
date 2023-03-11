const getHandles = require("./getHandles");
const _cleantime = require("./_cleantime");

async function getApiAdmin() {
    let j = require("../variables/j");
    let _logs = global.logs;
    let logs = { "all": {} };

    Object.keys(_logs.all).slice((Object.keys(_logs.all).length - 50)).forEach(a => {
        logs.all[a] = _logs.all[a];
    });

    let r = {
        "logchannels": (j.logclient?.channels?.length ?? null),
        "channels": (j.client?.channels?.length ?? null),
        "discordservers": (j.discordclient.guilds.cache.size ?? null),
        "modlookup": {
            "channels": await j.modinfosplitter.getMainKey(["channels", "num"]),
            "users": await j.modinfosplitter.getMainKey(["users", "num"])
        },
        "viplookup": {
            "channels": await j.vipinfosplitter.getMainKey(["channels", "num"]),
            "users": await j.vipinfosplitter.getMainKey(["users", "num"])
        },
        "memory": j.systeminfo.memory,
        "cpu": j.systeminfo.cpu,
        "handled": getHandles(0),
        "handledSecond": getHandles(1001),
        "handledMinute": getHandles(60 * 1000),
        "uptime": {
            "raw": j.systeminfo.uptime,
            "parsed": {}
        },
        "connections": {
            "client": j.client?.wsConnections ?? "-",
            "logclient": j.logclient?.wsConnections ?? "-"
        },
        "logs": logs
    };

    Object.keys(r.uptime.raw).forEach(a => {
        if (typeof r.uptime.raw[a] !== "number") return r.uptime.parsed[a] = r.uptime.raw[a];

        r.uptime.parsed[a] = _cleantime(r.uptime.raw[a], 4).time.join(", ");
    });

    return r;
};

module.exports = getApiAdmin;