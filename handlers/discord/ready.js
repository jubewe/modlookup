const _log = require("../../functions/_log");
const _cleannumber = require("../../functions/_cleannumber");
const j = require("../../variables/j");

module.exports = async () => {
    _log(1, `Discordclient Connected`);

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

    function activity() {
        let acts = [
            `${_cleannumber(j.logclient.channels.length)} Channels`,
            `${_cleannumber(j.modinfosplitter.getMainKey(["channels", "num"]))} Modchannels`,
            `${_cleannumber(j.modinfosplitter.getMainKey(["users", "num"]))} Mods`,
            `${_cleannumber(j.vipinfosplitter.getMainKey(["channels", "num"]))} Vipchannels`,
            `${_cleannumber(j.vipinfosplitter.getMainKey(["users", "num"]))} Vips`
        ];

        if (activitynum >= acts.length) activitynum = 0;

        let act = acts[activitynum++];
        return {
            name: act,
            type: 3
        };
    };

    function changeActivity() {
        let act = activity();
        j.discordclient.user.setActivity(act);
    };
};