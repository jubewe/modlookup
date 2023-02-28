const _wf = require("./functions/_wf");
const files = require("./variables/files");
const paths = require("./variables/paths");

files.lel.handled = files.lel.handledMessages;
files.lel.handledLog = files.lel.handledMessages;
files.lel.handledWebsiteRequests = files.lel.handledRequests;

delete files.lel.handledMessages;
delete files.lel.handledRequests;

_wf(paths.lel, files.lel);