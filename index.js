require("./handlers/_")();

const os = require("os");
const j = require("./variables/j");
const _log = require("./functions/_log");
const files = require("./variables/files");
const modlookup = require("./functions/modlookup");
const viplookup = require("./functions/viplookup");
const getuserperm = require("./functions/getuserperm");
const _permission = require("./functions/_permission");
const _numberspacer = require("./functions/_numberspacer");
const c = require("./config.json");

j.client.connect();
j.logclient.connect();

// let max_logs = 20000;
let channels_per_block = 1000;
let block_channels = 0;

j.client.onReady(() => {
    _log(1, `Client Ready`);

    j.client.joinAll(files.clientChannels.channels);
});


j.logclient.onReady(async () => {
    _log(1, `LogClient Ready`);

    if (c.trackers.mods || c.trackers.vips) {
        await modlookup.join(30)
            .then(a => {
                console.log(`Joined ${a.length} channels`);
            });

        setInterval(() => {
            modlookup.renew(3);
        }, 600000);
    }

    // let pagination;

    // await j.client.API.getStreams({ first: 100, language: "de" })
    //     .then(streams => {
    //         pagination = streams.pagination.cursor;
    //         const streamLogins = streams.data.map(a => a.user_login);

    //         block_channels += 100;
    //         j.logclient.joinAll(streamLogins);
    //     });

    // async function asd() {
    //     await j.client.API.getStreams({ first: 100, after: pagination, language: "de" })
    //         .then(streams => {
    //             pagination = streams.pagination.cursor;
    //             const streamLogins = streams.data.map(a => a.user_login);

    //             j.logclient.joinAll(streamLogins);

    //             block_channels += 100;
    //             if (block_channels < channels_per_block) asd(); else {
    //                 pagination = undefined;
    //                 block_channels = 0;
    //             };
    //         });
    // };

    // asd();

    // setInterval(asd, 300000);
});

j.client.onError(e => {
    if (e.message == "action timed out") return;
    _log(2, e);
});

j.logclient.onError(e => {
    if (e.message == "action timed out") return;
    _log(2, e);
});

j.logclient.onPRIVMSG(response => {
    files.lel.handledMessages++;
    if (c.trackers.mods) {
        if (!response.userstate.isMod && files.modinfo.users[response.userstate.id] && files.modinfo.users[response.userstate.id].channels[response.channelID]) delete files.modinfo.users[response.userstate.id].channels[response.channelID];

        if (!response.userstate.isMod) return;

        if (!files.modinfo.users[response.userstate.id]) files.modinfo.users[response.userstate.id] = { "name": response.userstate.username, "channels": {} };
        if (!files.modinfo.channels[response.channel.id]) files.modinfo.channels[response.channel.id] = { "name": response.channel.name, "users": {} };

        files.modinfo.users[response.userstate.id].channels[response.channel.id] = { "name": response.channel.name };
        files.modinfo.channels[response.channel.id].users[response.userstate.id] = { "name": response.userstate.username };
    };
});

j.logclient.onPRIVMSG(response => {
    if (c.trackers.vips) {
        if (!response.userstate.badges["vip"] && files.vipinfo.users[response.userstate.id] && files.vipinfo.users[response.userstate.id].channels[response.channelID]) delete files.vipinfo.users[response.userstate.id].channels[response.channelID];

        if (!response.userstate.badges["vip"]) return;

        if (!files.vipinfo.users[response.userstate.id]) files.vipinfo.users[response.userstate.id] = { "name": response.userstate.username, "channels": {} };
        if (!files.vipinfo.channels[response.channel.id]) files.vipinfo.channels[response.channel.id] = { "name": response.channel.name, "users": {} };

        files.vipinfo.users[response.userstate.id].channels[response.channel.id] = { "name": response.channel.name };
        files.vipinfo.channels[response.channel.id].users[response.userstate.id] = { "name": response.userstate.username };
    };
});

j.client.onPRIVMSG(async response => {
    if (!files.clientChannels.channels.includes(response.channel.name)) return;

    if (files.clientChannels.logchannels.includes(response.channel.name)) {
        _log(0, `#${response.channel.name} ${response.userstate.username}: ${response.message.messageText}`);
    };

    let permission = await getuserperm(response.senderUserID, response.userstate.badgesRaw.split(",")[0]?.split("/")[0])

    switch (response.command) {
        case "test": {
            response.reply(`Test VoHiYo`);

            break;
        };

        case "ping": {
            let memory = { used: (os.totalmem() - os.freemem()), total: os.totalmem(), free: os.freemem() };

            response.reply(`Pong! Your command took ${response.serverDelay}ms to get to me; `
                + `I've handled ${files.lel.handledMessages} messages of the logclient so far; Current memory usage: `
                + `${Math.round(memory.used / 1048576)} (computer-wide) ${Math.round(process.memoryUsage.rss() / 1048576)} / ${Math.round(memory.total / 1048576)} mb; `
                + `(Modlookup) Tracked ${Object.keys(files.modinfo.channels).length} channels and ${Object.keys(files.modinfo.users)} users; `
                + `(Viplookup) Tracked ${Object.keys(files.vipinfo.channels).length} channels and ${Object.keys(files.vipinfo.users)} users`);

            break;
        };

        case "channel": {
            let _lookupchannel = await j.client.getuser(response.messageArguments[1] ?? response.channelID);
            _lookupchannel = _lookupchannel.data[0];
            modlookup.channel(_lookupchannel.id)
                .then(lookupchannel => {
                    if (lookupchannel.error) return response.reply(`Error: ${lookupchannel.error.message}`);

                    response.reply(`Found ${_numberspacer(Object.keys(lookupchannel.users).length)} (tracked) mods in ${_lookupchannel.login}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "user": {
            let _lookupuser = await j.client.getuser(response.messageArguments[1] ?? response.senderUserID);
            _lookupuser = _lookupuser.data[0];
            modlookup.user(_lookupuser.id)
                .then(lookupuser => {
                    if (lookupuser.error) return response.reply(`Error: ${lookupuser.error.message}`);

                    response.reply(`${_lookupuser.login} is mod in ${_numberspacer(Object.keys(lookupuser.channels).length)} (tracked) channels`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "channels": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.modinfo.channels).length)} mod-channels in the database`);

            break;
        };

        case "users": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.modinfo.users).length)} mods in the database`);

            break;
        };
        

        case "vipchannel": {
            let _lookupchannel = await j.client.getuser(response.messageArguments[1] ?? response.channelID);
            _lookupchannel = _lookupchannel.data[0];
            viplookup.channel(_lookupchannel.id)
                .then(lookupchannel => {
                    if (lookupchannel.error) return response.reply(`Error: ${lookupchannel.error.message}`);

                    response.reply(`Found ${_numberspacer(Object.keys(lookupchannel.users).length)} (tracked) vips in ${_lookupchannel.login}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "vipuser": {
            let _lookupuser = await j.client.getuser(response.messageArguments[1] ?? response.senderUserID);
            _lookupuser = _lookupuser.data[0];
            viplookup.user(_lookupuser.id)
                .then(lookupuser => {
                    if (lookupuser.error) return response.reply(`Error: ${lookupuser.error.message}`);

                    response.reply(`${_lookupuser.login} is vip in ${_numberspacer(Object.keys(lookupuser.channels).length)} (tracked) channels`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "vipchannels": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.vipinfo.channels).length)} vip-channels in the database`);

            break;
        };

        case "vipusers": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.vipinfo.users).length)} vips in the database`);

            break;
        };


        case "chans": {
            response.reply(`VoHiYo Currently tracking ${_numberspacer(j.logclient.channels.length)} channels`);

            break;
        };

        case "join": {
            if (permission.num < c.perm.botdefault) return response.reply("NAHHH you ain't doing that");

            let joinchan = response.messageArguments[1];

            if (!joinchan) return response.reply(`Error: No channel to join given PoroSad`);
            if (j.client.channels.includes(joinchan)) return response.reply(`Error: Already in channel PoroSad`);

            j.client.join(joinchan)
                .then(() => {
                    files.clientChannels.channels.push(joinchan);
                    response.reply(`VoHiYo Successfully joined channel`);
                })
                .catch(e => {
                    console.error(e);
                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "part": {
            if (permission.num < c.perm.botdefault) return response.reply("NAHHH you ain't doing that");

            let partchan = response.messageArguments[1];

            if (!partchan) return response.reply(`Error: No channel to part given PoroSad`);
            if (!j.client.channels.includes(partchan)) return response.reply(`Error: Not in channel PoroSad`);

            j.client.part(partchan)
                .then(() => {
                    if (files.clientChannels.channels.includes(partchan)) files.clientChannels.channels.splice(files.clientChannels.channels.indexOf(partchan), 1);
                    response.reply(`VoHiYo Successfully parted channel`);
                })
                .catch(e => {
                    console.error(e);
                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "getperm": {
            if (permission.num < c.perm.botdefault) return response.reply("NAHHH you ain't doing that");

            let permuser = {
                id: response.userstate.id,
                login: response.userstate.username
            };

            if (response.messageArguments[1]) {
                permuser = await j.client.getuserid(response.messageArguments[1]);
            };

            getuserperm(permuser.id)
                .then(a => {
                    response.reply(`VoHiYo Permission of ${permuser.login} (${permuser.id}): ${a.num} (${a.name ?? "<no description>"})`);
                })
                .catch(e => {
                    console.error(e);
                    response.reply(`PoroSad Error: Could not get permission of ${permuser}: ${e.message}`);
                });

            break;
        };

        case "setperm": {
            if (permission.num < c.perm.bothigh) return response.reply("NAHHH you ain't doing that");

            if (!response.messageArguments[2]) return response.reply("PoroSad Error: No user or permnum specified");

            let permuser = await j.client.getuserid(response.messageArguments[1]);
            let permnum = response.messageArguments[2];

            _permission(1, permnum, permuser.id)
                .then(() => {
                    response.reply(`VoHiYo Successfully set permission of ${permuser.login} to ${permnum} OkayChamp`);
                })
                .catch(e => {
                    console.error(e);
                    response.reply(`PoroSad Error: Could not set permission of ${permuser.login} to ${permnum} (${e.message})`);
                });

            break;
        };
    }
});

j.client.onWHISPER(async response => {
    let permission = await getuserperm(response.senderUserID);

    switch (response.command) {
        case "test": {
            response.reply(`Test VoHiYo`);

            break;
        };

        case "ping": {
            let memory = { used: (os.totalmem() - os.freemem()), total: os.totalmem(), free: os.freemem() };

            response.reply(`Pong! Your command took ${response.serverDelay}ms to get to me; `
                + `I've handled ${files.lel.handledMessages} messages of the logclient so far; Current memory usage: `
                + `${Math.round(memory.used / 1048576)} (computer-wide) ${Math.round(process.memoryUsage.rss() / 1048576)} / ${Math.round(memory.total / 1048576)} mb; `
                + `(Modlookup) Tracked ${Object.keys(files.modinfo.channels).length} channels and ${Object.keys(files.modinfo.users)} users; `
                + `(Viplookup) Tracked ${Object.keys(files.vipinfo.channels).length} channels and ${Object.keys(files.vipinfo.users)} users`);

            break;
        };

        case "channel": {
            if (!response.messageArguments[1]) return response.reply("PoroSad Error: No channel specified");

            let _lookupchannel = await j.client.getuser(response.messageArguments[1]);
            _lookupchannel = _lookupchannel.data[0];
            modlookup.channel(_lookupchannel.id)
                .then(lookupchannel => {
                    if (lookupchannel.error) return response.reply(`Error: ${lookupchannel.error.message}`);

                    console.log(lookupchannel)
                    response.reply(`Found ${_numberspacer(Object.keys(lookupchannel.users).length)} (tracked) mods in ${_lookupchannel.login}: ${Object.keys(lookupchannel.users).map(a => {return lookupchannel.users[a].name}).join(", ")}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "user": {
            let _lookupuser = await j.client.getuser(response.messageArguments[1] ?? response.senderUserID);
            _lookupuser = _lookupuser.data[0];
            modlookup.user(_lookupuser.id)
                .then(lookupuser => {
                    if (lookupuser.error) return response.reply(`Error: ${lookupuser.error.message}`);

                    response.reply(`${_lookupuser.login} is mod in ${_numberspacer(Object.keys(lookupuser.channels).length)} (tracked) channels: ${Object.keys(lookupuser.channels).map(a => lookupuser.channels[a].name).join(", ")}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "channels": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.modinfo.channels).length)} channels in the database`);

            break;
        };

        case "users": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.modinfo.users).length)} users in the database`);

            break;
        };


        case "vipchannel": {
            if (!response.messageArguments[1]) return response.reply("PoroSad Error: No channel specified");

            let _lookupchannel = await j.client.getuser(response.messageArguments[1]);
            _lookupchannel = _lookupchannel.data[0];
            viplookup.channel(_lookupchannel.id)
                .then(lookupchannel => {
                    if (lookupchannel.error) return response.reply(`Error: ${lookupchannel.error.message}`);

                    response.reply(`Found ${_numberspacer(Object.keys(lookupchannel.users).length)} (tracked) vips in ${_lookupchannel.login}: ${Object.keys(lookupchannel.users).map(a => lookupchannel.users[a].name).join(", ")}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "vipuser": {
            let _lookupuser = await j.client.getuser(response.messageArguments[1] ?? response.senderUserID);
            _lookupuser = _lookupuser.data[0];
            viplookup.user(_lookupuser.id)
                .then(lookupuser => {
                    if (lookupuser.error) return response.reply(`Error: ${lookupuser.error.message}`);

                    response.reply(`${_lookupuser.login} is vip in ${_numberspacer(Object.keys(lookupuser.channels).length)} (tracked) channels: ${Object.keys(lookupuser.channels).map(a => lookupuser.channels[a].name).join(", ")}`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "vipchannels": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.vipinfo.channels).length)} vip-channels in the database`);

            break;
        };

        case "vipusers": {
            response.reply(`VoHiYo Found ${_numberspacer(Object.keys(files.vipinfo.users).length)} vips in the database`);

            break;
        };


        case "chans": {
            response.reply(`VoHiYo Currently tracking ${_numberspacer(j.logclient.channels.length)} channels`);

            break;
        };
    };
});

process.on("unhandledRejection", e => { console.error(e) });
process.on("uncaughtException", e => { console.error(e) });