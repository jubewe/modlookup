require("./handlers/_")();

const os = require("os");
const j = require("./variables/j");
const _log = require("./functions/_log");
const files = require("./variables/files");
const modlookup = require("./functions/modlookup");

j.client.connect();
j.logclient.connect();

let max_logs = 20000;

j.client.onReady(() => {
    _log(1, `Client Ready`);

    j.client.joinAll(files.clientChannels.channels);
});

j.logclient.onReady(async () => {
    _log(1, `LogClient Ready`);

    let pagination;

    await j.client.API.getStreams({ first: 100 })
        .then(streams => {
            pagination = streams.pagination.cursor;
            const streamLogins = streams.data.map(a => a.user_login);

            j.logclient.joinAll(streamLogins);

        });

    async function asd() {
        await j.client.API.getStreams({ first: 100, after: pagination })
            .then(streams => {
                pagination = streams.pagination.cursor;
                const streamLogins = streams.data.map(a => a.user_login);

                j.logclient.joinAll(streamLogins);

                if (j.logclient.channels.length < max_logs) asd();
            });
    };

    asd();

    setInterval(asd, 300000);
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
    if (!response.userstate.isMod && files.modinfo.users[response.userstate.id] && files.modinfo.users[response.userstate.id].channels[response.channelID]) delete files.modinfo.users[response.userstate.id].channels[response.channelID];

    if (!response.userstate.isMod) return;

    if (!files.modinfo.users[response.userstate.id]) files.modinfo.users[response.userstate.id] = { "name": response.userstate.username, "channels": {} };
    if (!files.modinfo.channels[response.channel.id]) files.modinfo.channels[response.channel.id] = { "name": response.channel.name, "users": {} };

    files.modinfo.users[response.userstate.id].channels[response.channel.id] = { "name": response.channel.name };
    files.modinfo.channels[response.channel.id].users[response.userstate.id] = { "name": response.userstate.id };
});

j.client.onPRIVMSG(async response => {
    if (!files.clientChannels.channels.includes(response.channel.name)) return;

    if (files.clientChannels.logchannels.includes(response.channel.name)) {
        _log(0, `#${response.channel.name} ${response.userstate.username}: ${response.message.messageText}`);
    };

    switch (response.command) {
        case "test": {
            response.reply(`Test VoHiYo`);

            break;
        };

        case "ping": {
            let memory = { used: (os.totalmem() - os.freemem()), total: os.totalmem(), free: os.freemem() };

            response.reply(`Pong! Your command took ${response.serverDelay}ms to get to me; Current memory usage: ${Math.round(memory.used / 1048576)} (computer-wide) ${Math.round(process.memoryUsage.rss() / 1048576)} / ${Math.round(memory.total / 1048576)} mb`);

            break;
        };

        case "channel": {
            let _lookupchannel = await j.client.getuser(response.messageArguments[1] ?? response.channelID);
            _lookupchannel = _lookupchannel.data[0];
            modlookup.channel(_lookupchannel.id)
                .then(lookupchannel => {
                    if (lookupchannel.error) return response.reply(`Error: ${lookupchannel.error.message}`);

                    response.reply(`Found ${Object.keys(lookupchannel.users).length} (tracked) mods in ${_lookupchannel.login}`);
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

                    response.reply(`${_lookupuser.login} is mod in ${Object.keys(lookupuser.channels).length} (tracked) channels`);
                })
                .catch(e => {
                    console.error(e);

                    response.reply(`Errored PoroSad`);
                });

            break;
        };

        case "channels": {
            response.reply(`VoHiYo Found ${Object.keys(files.modinfo.channels).length} channels in the database`);

            break;
        };

        case "users": {
            response.reply(`VoHiYo Found ${Object.keys(files.modinfo.users).length} users in the database`);

            break;
        };

        case "chans": {
            response.reply(`Currently tracking ${j.logclient.channels.length} channels`);

            break;
        };
    }
});

process.on("unhandledRejection", e => { console.error(e) });
process.on("uncaughtException", e => { console.error(e) });