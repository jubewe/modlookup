// const _rf = require("./functions/_rf");
// const paths = require("./variables/paths");
// const regex = require("oberknecht-client/lib/var/regex");
// const _chunkArray = require("./functions/_chunkArray");
// const { oberknechtAPI } = require("oberknecht-api");
// const _wf = require("./functions/_wf");
// const env = require("dotenv").config().parsed;

const files = require("./variables/files");
const j = require("./variables/j");

// let modinfo = _rf(paths.modinfo, true);
// let modinfostring = JSON.stringify(modinfo);
// let requestusers = {
//     "users": {},
//     "channels": {}
// };

// const API = new oberknechtAPI({
//     token: env.T_TOKEN
// });

// Object.keys(modinfo.users).forEach(user => {
//     let numchannels = Object.keys(modinfo.users[user].channels).filter(channel => regex.numregex().test(modinfo.users[user].channels[channel].name))

//     if (numchannels.length > 0) requestusers.users[user] = numchannels;
// });

// Object.keys(modinfo.channels).forEach(channel => {
//     let numusers = Object.keys(modinfo.channels[channel].users).filter(user => regex.numregex().test(modinfo.channels[channel].users[user].name));

//     if (numusers.length > 0) requestusers.channels[channel] = numusers;
// });

// let filteredrequestusers = {
//     "users": [],
//     "channels": []
// };

// Object.keys(requestusers.users).forEach(user => { requestusers.users[user].forEach(channel => { if (!filteredrequestusers.users.includes(channel)) { filteredrequestusers.users.push(channel) } }) });
// Object.keys(requestusers.channels).forEach(channel => { requestusers.channels[channel].forEach(user => { if (!filteredrequestusers.channels.includes(user)) { filteredrequestusers.channels.push(user) } }) });

// (async () => {
//     await API.verify();

//     let chunked = {
//         // "users": _chunkArray(filteredrequestusers.users, 100),
//         // "channels": _chunkArray(filteredrequestusers.channels, 100)
//         "all": _chunkArray([...filteredrequestusers.channels, ...filteredrequestusers.users], 100)
//     };

//     let replaced = {};
//     let errored = {};

//     Object.keys(chunked).forEach(async (chunkedkey) => {
//         console.log(`Key: ${chunkedkey}`);
//         let matches = 0;
//         await Promise.all(chunked[chunkedkey].map(async (chunk, i) => {
//             console.log(`Chunk: ${i}`);
//             return await API.getUsers([], chunk);
//         }))
//             .then(chunkdata => {
//                 let data = [];
//                 chunkdata.forEach(a => data.push(...a.data));
//                 console.log(`${chunkdata.length} returned data: ${data.length}`);
//                 data.forEach(u => {
//                     matches += modinfostring.match(new RegExp(`"name":"${u.id}"`, "gi")).length ?? 0;
//                     modinfostring = modinfostring.replace(new RegExp(`"name":"${u.id}"`, "gi"), `"name":"${u.login}"`);
//                     // if (!replaced[chunkedkey]) replaced[chunkedkey] = [];

//                     // Object.keys(requestusers[chunkedkey]).forEach(asd => {
//                     //     if (requestusers[chunkedkey][asd][(chunkedkey == "users" ? "channels" : "users")][u.id]) {
//                     //         modinfo[chunkedkey][asd][(chunkedkey == "users" ? "channels" : "users")][u.id].name = u.login;
//                     //         requestusers[chunkedkey][asd][(chunkedkey == "users" ? "channels" : "users")][u.id].name = u.login;
//                     //         replaced[chunkedkey].push(u.id);
//                     //     };
//                     // });
//                 });

//             })
//             .catch(e => {
//                 if (!errored[chunkedkey]) errored[chunkedkey] = [];

//                 errored[chunkedkey].push(e);
//             });

//         console.log(`Successfully replaced ${replaced[chunkedkey]?.length ?? 0} ${chunkedkey} (matched: ${matches})`, `> Errored on ${errored[chunkedkey]?.length ?? 0}`);
//         _wf(paths.modinfo, modinfostring);
//     });
// })();

// console.log(j.modinfosplitter.create(files.modinfo) ? "Successfully splitted json Pag heCrazy" : "sadE ?!");
// console.log(j.vipinfosplitter.create(files.vipinfo) ? "Successfully splitted json Pag heCrazy" : "sadE ?!");

// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "187"], {"name":"PauseChamp"}));
// console.log(j.modinfosplitter.getKey(["users", "263830208"]));
// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "123"], {"name": "asd"}));
// console.log(j.modinfosplitter.getKeyFromObject(j.modinfosplitter.getKey(["users", "263830208"]), ["channels"]));
// console.log(j.modinfosplitter.addKeysToObject(j.modinfosplitter.getKey(["users", "263830208"]), ["channels", "123"], {"name": "descht"}));
// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "123"], {"name": "descht"}))

// console.log(j.modinfosplitter.editKey(["users", "263830208"], j.modinfosplitter.addKeysToObject(j.modinfosplitter.getKey(["users", "263830208", "channels"]), ["123"], {"name": "asd"})));
// console.log(j.modinfosplitter.getKey(["users", "263830208"]));
// console.log(j.modinfosplitter.getMainKey(["users", "1234", "channels"]));

console.log(j.vipinfosplitter.getMainKey(["users", "num"]));