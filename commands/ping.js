const files = require("../variables/files");
const j = require("../variables/j");
const os = require("os");
const _cleantime = require("../functions/_cleantime");
const j_ = require("../classes/j_");

module.exports = {
    name: "ping",
    /** @param {j_} response */
    exec: async (response) => {
        let handledMessagescache = j.handledMessagescache;
        let memory = { used: (os.totalmem() - os.freemem()), total: os.totalmem(), free: os.freemem() };

        response.reply(
            `Pong! Your command took ${response.serverDelay}ms to get to me; `
            + `I've handled ${files.lel.handledMessages} messages of the logclient (in ${_cleantime(Date.now() - j.development_start.getTime(), 4).time.join(" and ")}); Current memory usage: `
            + `${Math.round(memory.used / 1048576)} (computer-wide) ${Math.round(process.memoryUsage.rss() / 1048576)} / ${Math.round(memory.total / 1048576)} mb; `
            + `(Modlookup) Tracked ${j.modinfosplitter.getMainKey(["channels", "num"])} channels and ${j.modinfosplitter.getMainKey(["users", "num"])} users; `
            + `(Viplookup) Tracked ${j.vipinfosplitter.getMainKey(["channels", "num"])} channels and ${j.vipinfosplitter.getMainKey(["users", "num"])} users; `
            + `Messages per minute: ${files.lel.handledMessages - handledMessagescache[Object.keys(handledMessagescache).filter(a => a >= (Date.now() - 60000))[0]]};`
        );
    }
};