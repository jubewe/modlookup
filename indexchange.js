const _wf = require("./functions/_wf");
const files = require("./variables/files");
const j = require("./variables/j");
const paths = require("./variables/paths");

// _wf(paths.suggestedchannels, { "channels": {}, "users": {} });

let suggestedchannels = {...files.suggestedchannels};

Object.keys(files.suggestedchannels.channels).forEach(a => {
    let users = [...files.suggestedchannels.channels[a].users];
    if (Array.isArray(suggestedchannels.channels[a].users)) suggestedchannels.channels[a].users = {};
    users.forEach(b => {
        suggestedchannels.channels[a].users[b] = {};
    });
});

Object.keys(files.suggestedchannels.users).forEach(a => {
    let channels = [...files.suggestedchannels.users[a].channels];
    if (Array.isArray(suggestedchannels.users[a].channels)) suggestedchannels.users[a].channels = {};
    channels.forEach(b => {
        suggestedchannels.users[a].channels[b] = {};
    });
});

j.suggestedchannelssplitter.create(suggestedchannels);

// j.usersplitter.create({
//     "users": {}
// });

// j.channelsplitter.create({
//     "channels": {}
// });

// j.blacklistsplitter.create({
//     "users": {}
// });

// files.clientChannels.permanentlogchannels = [];
// _wf(paths.clientChannels, files.clientChannels);

// files.lel.handled = files.lel.handledMessages;
// files.lel.handledLog = files.lel.handledMessages;
// files.lel.handledWebsiteRequests = files.lel.handledRequests;

// delete files.lel.handledMessages;
// delete files.lel.handledRequests;

// _wf(paths.lel, files.lel);