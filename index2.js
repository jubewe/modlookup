const _rf = require("./functions/_rf");
const paths = require("./variables/paths");
const regex = require("oberknecht-client/lib/var/regex");
const _chunkArray = require("./functions/_chunkArray");
const { oberknechtAPI } = require("oberknecht-api");
const env = require("dotenv").config().parsed;

let modinfo = _rf(paths.modinfo, true);
let requestusers = {
    "users": [],
    "channels": []
};

const API = new oberknechtAPI({
    token: env.T_TOKEN
});

Object.keys(modinfo.users).forEach(user => {
    if (!regex.numregex().test(modinfo.users[user].name)) requestusers.users.push(user);
});

Object.keys(modinfo.channels).forEach(user => {
    if (!regex.numregex().test(modinfo.channels[user].name)) requestusers.channels.push(user);
});

(async () => {
    await API.verify();

    let chunked = {
        "users": _chunkArray(requestusers.users, 100),
        "channels": _chunkArray(requestusers.channels, 100)
    };

    let replaced = {};
    let errored = {};

    Object.keys(chunked).forEach(async (chunkedkey) => {
        await Promise.all(chunked[chunkedkey].map(async chunk => {
            return await API.getUsers([], chunk);
        }))
            .then(chunkdata => {
                let data = [];
                chunkdata.forEach(a => data.push(...a.data));
                data.forEach(u => {
                    if (!replaced[chunkedkey]) replaced[chunkedkey] = [];

                    replaced[chunkedkey].push(u.id);
                    modinfo[chunkedkey][u.id].name = u.login;
                });

            })
            .catch(e => {
                if (!errored[chunkedkey]) errored[chunkedkey] = [];

                errored[chunkedkey].push(...e);
            });

        console.log(`Successfully replaced ${replaced[chunkedkey]?.length ?? 0} ${chunkedkey}`, `> Errored on ${errored[chunkedkey]?.length ?? 0}`);
    });
})();