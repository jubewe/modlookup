const _wf = require("./functions/_wf");
const files = require("./variables/files");
const j = require("./variables/j");
const paths = require("./variables/paths");

// _wf(paths.suggestedchannels, { "channels": {}, "users": {} });

j.usersplitter.create({
    "users": {}
});

j.channelsplitter.create({
    "channels": {}
});

j.blacklistsplitter.create({
    "users": {}
});

// files.clientChannels.permanentlogchannels = [];
// _wf(paths.clientChannels, files.clientChannels);

// files.lel.handled = files.lel.handledMessages;
// files.lel.handledLog = files.lel.handledMessages;
// files.lel.handledWebsiteRequests = files.lel.handledRequests;

// delete files.lel.handledMessages;
// delete files.lel.handledRequests;

// _wf(paths.lel, files.lel);