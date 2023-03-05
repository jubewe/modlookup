const _log = require("../../functions/_log");
const _cleannumber = require("../../functions/_cleannumber");
const j = require("../../variables/j");
const _stackname = require("../../functions/_stackname");

module.exports = async () => {
    _log(1, `${_stackname("discordclient")[3]} Ready`);

    j.discordclient.user.setPresence({
        status: "online",
        activities: [
            {
                "name": "Website",
                "url": "https://modlookup.jubewe.de",
                "type": 1
            }
        ]
    });

    setInterval(changeActivity, 10000);

    let activitynum = 0;

    async function activity() {
        let acts = [
            `${_cleannumber(j.logclient?.channels?.length) ?? 0} Channels`,
            `${_cleannumber(await j.modinfosplitter?.getMainKey(["channels", "num"])) ?? 0} Modchannels`,
            `${_cleannumber(await j.modinfosplitter?.getMainKey(["users", "num"])) ?? 0} Mods`,
            `${_cleannumber(await j.vipinfosplitter?.getMainKey(["channels", "num"])) ?? 0} Vipchannels`,
            `${_cleannumber(await j.vipinfosplitter?.getMainKey(["users", "num"])) ?? 0} Vips`
        ];

        if (activitynum >= acts.length) activitynum = 0;

        let act = acts[activitynum++];
        return {
            name: act,
            type: 3
        };
    };

    async function changeActivity() {
        let act = await activity();
        j.discordclient.user.setActivity(act);
    };
};