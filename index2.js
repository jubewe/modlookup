// const _rf = require("./functions/_rf");
// const paths = require("./variables/paths");
// const regex = require("oberknecht-client/lib/var/regex");
// const _chunkArray = require("./functions/_chunkArray");
// const { oberknechtAPI } = require("oberknecht-api");
// const _wf = require("./functions/_wf");
// const env = require("dotenv").config().parsed;

const _rf = require("./functions/_rf");
const files = require("./variables/files");
const j = require("./variables/j");

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


let modinfo = _rf("./data_old/modinfo.json", true);
let vipinfo = _rf("./data_old/vipinfo.json", true);

console.log(j.modinfosplitter.create(modinfo) ? "Successfully splitted json Pag heCrazy" : "sadE ?!");
console.log(j.vipinfosplitter.create(vipinfo) ? "Successfully splitted json Pag heCrazy" : "sadE ?!");

return;


// console.log(j.modinfosplitter.getMainPath(["channels"]))
// console.log(j.modinfosplitter.getMainKey(["channels", "num"]));

// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "187"], {"name":"PauseChamp"}));

// console.log(j.modinfosplitter.getKey(["users", "263830208"]));
(async () => {
    console.log(await j.modinfosplitter.getKey(["channels", "21841789"], true));
    
    await j.modinfosplitter.addKey(["channels", "21841789"], { "name": "dest", "users": {} });
    
    console.log(await j.modinfosplitter.getKey(["channels", "21841789"], true));
    
    await j.modinfosplitter.editKey(["channels", "21841789", "users", "321"], { "name": "tesd" });
    
    console.log(await j.modinfosplitter.getKey(["channels", "21841789"], true));
    
    // console.log(await j.modinfosplitter.getKey(["users", "263830208", "channels"]));
    // await j.modinfosplitter.editKey(["users", "263830208", "channels", "187"], { "name": "PauseChamp" });
    // console.log(await j.modinfosplitter.getKey(["users", "263830208", "channels"]));
})();
// console.log(j.modinfosplitter.getKey(["users", "263830208"]));

// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "123"], {"name": "asd"}));
// console.log(j.modinfosplitter.getKeyFromObject(j.modinfosplitter.getKey(["users", "263830208"]), ["channels"]));
// console.log(j.modinfosplitter.addKeysToObject(j.modinfosplitter.getKey(["users", "263830208"]), ["channels", "123"], {"name": "descht"}));
// console.log(j.modinfosplitter.editKey(["users", "263830208", "channels", "123"], {"name": "descht"}))

// console.log(j.modinfosplitter.editKey(["users", "263830208"], j.modinfosplitter.addKeysToObject(j.modinfosplitter.getKey(["users", "263830208", "channels"]), ["123"], {"name": "asd"})));
// console.log(j.modinfosplitter.getKey(["users", "263830208"]));
// console.log(j.modinfosplitter.getMainKey(["users", "1234", "channels"]));

// console.log(j.vipinfosplitter.getMainKey(["users", "num"]));