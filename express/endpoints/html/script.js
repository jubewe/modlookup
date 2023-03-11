const url = new URL(document.baseURI);
const api_url = (url.origin.split(".")[0].split("-dest")[0] + "-api" + (url.origin.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.origin.split(".").slice(1).join("."));
const ws_url = (url.origin.split(".")[0].split("-dest")[0] + "-ws" + (url.origin.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.origin.split(".").slice(1).join("."));
function apiurl(u) { return api_url + (!u.startsWith("/") ? "/" : "") + (u) };
function siteurl(u) { return url.origin + (!u.startsWith("/") ? "/" : "") + (u) };
function redirect(url_, method) { window.open(url_, (method ?? "_blank")) };
function redirectSelf(url_) { redirect(url_, "_self") };
const currentendpoint = document.URL.replace(/http(s)*:\/\/(mod|vip)lookup(-dest)*\.jubewe\.de/g, "");
const currentendpointpath = currentendpoint.split("/").slice(0, 3).join("/").split(/#|\?/)[0];
const currentendpointparts = currentendpoint.split("/").slice(1);
let autoexecs = 0;
let interval_times = {
    "admin": 3000,
    "suggestchannel": 30000
};
let requests_failed = 0;
let interval;
let isFirst = true;
let page_data = {};
let devMode = false;
if (url.searchParams.get("devmode")) devMode = true;

let icon_elems = document.querySelectorAll(".j_icon");
let icon_elems_2 = document.querySelectorAll("j_icon");
let login_elem = document.querySelector("#j_login");
let pagename_elem = document.querySelector("#j_pagename");
let spacer = document.createElement("j_spacer");
let spacer_inline = document.createElement("j_spacer_inline");
let br = document.createElement("br");
let progress_elem = document.getElementById("j_progress");
let notification_elem = document.querySelector("j_notification");

function progress(num) {
    const num_ = (num > 0 && num < 1 ? num * 100 : num);

    if (num_ < 100) progress_elem.classList.replace("progress_load_end", "progress_load");
    if (num_ === 100) progress_elem.classList.replace("progress_load", "progress_load_end");

    setTimeout(() => {
        progress_elem.style.display = (num_ >= 0 && num_ < 100 ? "block" : "none");
    }, (num_ >= 0 && num_ < 100 ? 0 : 1500))
    progress_elem.value = num_;
};

function notification(message, timeout, iserror) {
    notification_elem = document.querySelector("j_notification");
    if (!notification_elem) return;
    let notification_elem_text = document.querySelector("#j_notification");
    let add_classes = [];

    iserror = (iserror ?? (message instanceof Error || (message?.error ?? message?.error)));

    if (iserror) {
        message = `Error: ${(message.error?.message ?? message.error ?? message.message ?? message)}`;
        add_classes.push("j_notification-error");
    } else {
        add_classes.push("j_notification-default");
    }

    notification_elem.classList.add(...add_classes);
    notification_elem_text.innerText = message;
    setTimeout(() => {
        notification_elem_text.innerText = "";

        add_classes.forEach(a => notification_elem.classList.remove(a));
    }, (timeout ?? 4000));
};

let error = (message) => {
    console.error(message);
    notification(message, undefined, true);
};

function request(u, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    };
    progress(0);

    fetch(u, options)
        .then(async a => {
            progress(50);
            let r = await a.json();

            progress(100);

            setTimeout(() => {
                progress(-1);
            }, 1000);

            if (r.error) return callback(r, undefined);

            callback(undefined, r);
        })
        .catch(e => {
            callback(e, undefined);
        });
};

function auth() {
    if (!localStorage.getItem("auth")) return {};
    return {
        parsed: JSON.parse(localStorage.getItem("auth")),
        auth: localStorage.getItem("auth")
    };
};

function validatetoken() {
    if (!document.URL.includes("#access_token=")) return;
    let token = document.URL.split("#access_token=")[1].split("&")[0];
    request(apiurl("/token/validate"), {
        headers: {
            "authorization": token
        }
    }, (e, r) => {
        if (e) return error(e);

        let dat = r.data;
        console.log(`Successfully authorized`)
        localStorage.setItem("auth", JSON.stringify(dat));
        window.close();
    })
};

function login() {
    window.open(`https://id.twitch.tv/oauth2/authorize?client_id=1pnta1kpjqm4xth9e60czubvo1j7af&redirect_uri=${url.origin}/token/validate&scope=&response_type=token`, "_blank");
    new Promise((resolve) => {
        let int = setInterval(waitfortoken, 500);
        function waitfortoken() {
            if (!auth().auth) return;
            clearInterval(int);
            resolve();
        };
    })
        .then(() => {
            document.location.reload();
        })
};

function logout() {
    let auth_ = auth();

    fetch(`${api_url}/token/revoke`, {
        headers: {
            "auth": auth_.auth
        },
        method: "DELETE"
    })
        .then(async req => {
            await req.json();

            document.location.reload();
        })
        .catch(e => {
            error(e);
            document.location.reload();
        });

    localStorage.removeItem("auth");
};

function getKeyFromObject(object, keys) {
    let value = object;
    for (let i = 0; i < keys.length; i++) {
        if (value.hasOwnProperty(keys[i])) {
            value = value[keys[i]];
        } else {
            return undefined;
        }
    }
    return value;
};

function _numberspacer(num, replacer) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, replacer || " ");
};

function _pickrandom(pickarray, pickcount) {
    if (!pickcount || pickcount === 1) {
        return pickarray[Math.floor(Math.random() * pickarray.length)];
    } else {
        let return_ = [];
        for (i = 0; i < pickcount; i++) {
            return_.push(pickarray[Math.floor(Math.random() * pickarray.length)]);
        }
        return return_.join(" ");
    }
};

function _sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, (time ?? 1000)));
};

function createTable(tables, dat, tableName, parentElement, progressName, progressClasses) {
    Object.keys(tables).forEach((a, i) => {
        if (document.getElementById(`${tableName}_${i}`) === null) {
            let table_elem = document.createElement("table");
            table_elem.id = `${tableName}_${i}`;
            table_elem.classList.add("j_table", tableName);

            let th_tr_elem = document.createElement("tr");
            let tr_elem = document.createElement("tr");
            tr_elem.id = `${tableName}_${i}_tr_0`;
            tr_elem.classList.add(`${tableName}_${i}_tr`);

            tables[a].names.forEach((b, i2) => {
                let th_elem = document.createElement("th");
                th_elem.innerText = (b ?? "");
                if ((b?.toString()?.length ?? 0) === 0) {
                    th_elem.classList.add("noborder", "j_table-noval");
                } else {
                    th_elem.classList.add("j_table-hasval", "j_table-title");
                }
                th_elem.classList.add("j_table_th");

                th_tr_elem.appendChild(th_elem);
            });

            table_elem.appendChild(th_tr_elem);
            table_elem.appendChild(tr_elem);

            document.getElementById(parentElement).appendChild(table_elem);
        };

        let tabletr = document.getElementById(`${tableName}_${i}_tr_0`);
        let key_elem_index = 0;

        tables[a].keypaths.forEach((b, i2) => {
            let key_elem_id = `${tableName}_${i}_td_${i2}`;
            let key_elem_val_id = `${tableName}_${i}_td_${i2}_val`;
            let key_elem_progress_id = `${tableName}_${i}_td_${i2}_progress`;

            let iab = Array.isArray(b);
            let isProgress = (iab && b[0] === "@@progress"); if (isProgress) b = b.slice(1);
            let skipVal = (iab && b[0] === "@@skipval"); if (skipVal) b = b.slice(1);
            let isTH = (!iab && b.startsWith("@@th")); if (isTH) b = b.replace("@@th", "");
            let isHTML = (iab && b[0] === "@@html"); if (isHTML) b = b.slice(1);
            let elemType = "h";
            let haselemType = (iab && b[0] === "@@elemtype"); if (haselemType) { elemType = b[1]; b = b[2] };
            let noCopy = (iab && b[0] === "@@nocopy"); if (noCopy) b = b[1];

            let val = ((!iab || isHTML || noCopy) ? b : getKeyFromObject(dat, b));

            let val_ = val;
            if (Array.isArray(val)) {
                val_ = val.length;
            } else if (["string", "number"].includes(typeof val) && val.toString().includes(".")) {
                val_ = val.toString();
                val_ = val_.slice(0, (val_.split(".")[0].length + 1 + 2)) + "%";
            } else if (["number"].includes(typeof val)) {
                val_ = val.toString();
                val_ = _numberspacer(val_);
            };

            if (val === "\n") {
                key_elem_index = 0;

                const tabletrold = tabletr;
                const tabletroldnum = (tabletrold.id.split("_")[tabletrold.id.split("_").length - 1]);
                let tabletr_id = `${tabletrold.id.slice(0, (tabletrold.id.length - tabletroldnum.length))}${parseInt(tabletroldnum) + 1}`

                if (document.getElementById(tabletr_id)) {
                    tabletr = document.getElementById(tabletr_id);
                    return;
                };

                tabletr = document.createElement("tr");
                tabletr.id = tabletr_id;
                tabletr.classList.add(`${tableName}_${i}_tr`);

                document.getElementById(`${tableName}_${i}`).appendChild(tabletr);
            } else {
                if (document.getElementById(key_elem_id) === null) {
                    let key_elem = document.createElement((isTH ? "th" : "td"));
                    key_elem.classList.add("j_table_td", `${tableName}_td`, `${tableName}_${i}_td`, `${tableName}_td_${key_elem_index}`, `${tableName}_${i}_td_${key_elem_index}`);
                    key_elem.id = key_elem_id;

                    if ((val_?.toString()?.length ?? 0) === 0) {
                        key_elem.classList.add("noborder", "j_table-noval");
                    } else {
                        key_elem.classList.add("j_table-hasval");
                    };

                    // let key_elem_val = (isHTML ? val : document.createElement("h"));
                    let key_elem_val = document.createElement((isHTML ? "div" : elemType));
                    key_elem_val.id = key_elem_val_id;
                    // key_elem_val.classList.add(`${tableName}_${i}_val`, `j_table-hasval`);
                    key_elem_val.classList.add(`${tableName}_${i}_val`);
                    if (!skipVal && !isHTML) key_elem_val.innerText = val_;

                    if (isTH) {
                        key_elem.classList.add("j_table-title");
                    } else if (!isHTML && !noCopy) {
                        key_elem.classList.add("cursor-copy");
                        key_elem.onclick = () => { copy(key_elem) };
                    };

                    if (isHTML) {
                        b.forEach(a => {
                            key_elem_val.appendChild(a);
                        });
                    };

                    key_elem.appendChild(key_elem_val);

                    if (isProgress) {
                        let progress_elem = document.createElement("progress");
                        progress_elem.max = 100;
                        progress_elem.value = val;
                        progress_elem.classList.add(...progressClasses);
                        progress_elem.id = key_elem_progress_id;

                        key_elem.classList.add(`${progressName}_progress_parent`);
                        key_elem.appendChild(progress_elem);
                    };

                    tabletr.appendChild(key_elem);
                } else if (isProgress && document.getElementById(`${progressName}_progress`) !== null) {
                    document.getElementById(`${progressName}_progress`).value = val;
                    document.getElementById(key_elem_val_id).innerText = val_;
                } else {
                    document.getElementById(key_elem_val_id).innerText = val_;
                };

                key_elem_index++;
            };
        });
    });
};

async function copy() {
    if (!arguments[0].innerText && (!arguments[1] || (document.getElementById(arguments[1]) === null))) return;
    let element = (arguments[0].innerText ? arguments[0] : document.getElementById(arguments[1]));
    navigator.clipboard.writeText(arguments[1] ?? (["string", "number"].includes(arguments[0]) ? arguments[0] : (arguments[0].value ?? arguments[0].innerText ?? arguments[0])));
    element.classList.add("copied");
    await _sleep(1500);
    element.classList.remove("copied");
};

class ml {
    static users = () => {
        request(apiurl(`/modlookup/users`), (e, r) => {
            if (e) return error(e);

            document.getElementById("j_ml_users").style.display = "grid";
            document.getElementById("j_ml_users_number").innerText = r.data;
        })
    };

    static channels = () => {
        request(apiurl(`/modlookup/channels`), (e, r) => {
            if (e) return error(e);

            document.getElementById("j_ml_channels").style.display = "grid";
            document.getElementById("j_ml_channels_number").innerText = r.data;
        });
    };

    static user = (user) => {
        request(apiurl(`/modlookup/user/${user}`), (e, r) => {
            if (e) return error(e);
            if (devMode) console.debug("user", r);

            let mluser = r.data;
            document.getElementById("j_ml_user_user").innerText = `${mluser.name} (${mluser.id})`;
            document.getElementById("j_ml_user_channels_number").innerText = (mluser.num > 0 ? mluser.num : "none of the");
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            document.getElementById("j_ml_user").style.display = "grid";
            if (Object.keys(mluser.channels).length > 1 || mluser.num == 0) document.getElementById("j_ml_user_info").innerText += "s";
            if (mluser.num == 0) return;

            Object.keys(mluser.channels).sort((a, b) => { return mluser.channels[a].name - mluser.channels[b].name }).forEach(channel => {
                let channelelemtr = document.createElement("tr");
                channelelemtr.id = `ml_channel_${channel}`;
                channelelemtr.classList.add("j_table_tr", "j_table_tr_single");

                let channelelemtdname = document.createElement("td");
                let channelelemtdid = document.createElement("td");

                channelelemtdname.innerText = mluser.channels[channel].name;
                channelelemtdid.innerText = channel;

                [channelelemtdname, channelelemtdid].forEach(a => {
                    a.classList.add("j_table_td", "cursor-copy");
                    a.onclick = () => { copy(a) };
                    a.innerHTML = `<j_h>${a.innerText}</j_h>`;
                    channelelemtr.appendChild(a);
                });
                document.getElementById("j_table").appendChild(channelelemtr);
            });

            document.getElementById("j_table_div").style.display = "block";
        });
    };

    static channel = (channel) => {
        request(apiurl(`/modlookup/channel/${channel}`), (e, r) => {
            if (e) return error(e);
            if (devMode) console.debug("channel", r);

            let mlchannel = r.data;
            document.getElementById("j_ml_channel_channel").innerText = `${mlchannel.name} (${mlchannel.id})`;
            document.getElementById("j_ml_channel_users_number").innerText = (mlchannel.num > 0 ? mlchannel.num : "no");
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            document.getElementById("j_ml_channel").style.display = "grid";
            if (Object.keys(mlchannel.users).length > 1 || mlchannel.num == 0) document.getElementById("j_ml_channel_info").innerText += "s";
            if (mlchannel.num == 0) return;

            Object.keys(mlchannel.users).forEach(user => {
                let channelelemtr = document.createElement("tr");
                channelelemtr.id = `ml_user_${user}`;
                channelelemtr.classList.add("j_table_tr", "j_table_tr_single");

                let channelelemtdname = document.createElement("td");
                let channelelemtdid = document.createElement("td");
                channelelemtdname.innerText = mlchannel.users[user].name;
                channelelemtdid.innerText = user;

                [channelelemtdname, channelelemtdid].forEach(a => {
                    a.classList.add("j_table_td", "cursor-copy");
                    a.onclick = () => { copy(a) };
                    a.innerHTML = `<j_h>${a.innerText}</j_h>`;
                    channelelemtr.appendChild(a);
                });
                document.getElementById("j_table").appendChild(channelelemtr);
            });

            document.getElementById("j_table_div").style.display = "block";
        });
    };

    static main = () => {
        request(apiurl(`/modlookup`), (e, r) => {
            if (e) return error(e);

            let mldata = r.data;
            document.getElementById("j_ml_channels_number").innerText = mldata.channels;
            document.getElementById("j_ml_users_number").innerText = mldata.users;
            document.getElementById("j_ml").style.display = "grid";
        });
    };
};

class vl {
    static users = () => {
        request(apiurl(`/viplookup/users`), (e, r) => {
            if (e) return error(e);

            document.getElementById("j_vl_users").style.display = "grid";
            document.getElementById("j_vl_users_number").innerText = r.data;
        })
    };

    static channels = () => {
        request(apiurl(`/viplookup/channels`), (e, r) => {
            if (e) return error(e);

            document.getElementById("j_vl_channels").style.display = "grid";
            document.getElementById("j_vl_channels_number").innerText = r.data;
        });
    };

    static user = (user) => {
        request(apiurl(`/viplookup/user/${user}`), (e, r) => {
            if (e) return error(e);
            if (devMode) console.debug("user", r);

            let vluser = r.data;
            document.getElementById("j_vl_user_user").innerText = `${vluser.name} (${vluser.id})`;
            document.getElementById("j_vl_user_channels_number").innerText = (vluser.num > 0 ? vluser.num : "none of the");
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            document.getElementById("j_vl_user").style.display = "grid";
            if (Object.keys(vluser.channels).length > 1 || vluser.num == 0) document.getElementById("j_vl_user_info").innerText += "s";
            if (vluser.num == 0) return;

            Object.keys(vluser.channels).forEach(channel => {
                let channelelemtr = document.createElement("tr");
                let channelelemtdname = document.createElement("td");
                let channelelemtdid = document.createElement("td");

                channelelemtr.id = `vl_channel_${channel}`;
                channelelemtr.classList.add("j_table_tr", "j_table_tr_single");

                channelelemtdname.innerText = vluser.channels[channel].name;
                channelelemtdid.innerText = channel;

                [channelelemtdname, channelelemtdid].forEach(a => {
                    a.classList.add("j_table_td", "cursor-copy");
                    a.onclick = () => { copy(a) };
                    a.innerHTML = `<j_h>${a.innerText}</j_h>`;
                    channelelemtr.appendChild(a);
                });
                document.getElementById("j_table").appendChild(channelelemtr);
            });

            document.getElementById("j_table_div").style.display = "block";
        });
    };

    static channel = (channel) => {
        request(apiurl(`/viplookup/channel/${channel}`), (e, r) => {
            if (e) return error(e);
            if (devMode) console.debug("channel", r);

            let vlchannel = r.data;
            document.getElementById("j_vl_channel_channel").innerText = `${vlchannel.name} (${vlchannel.id})`;
            document.getElementById("j_vl_channel_users_number").innerText = (vlchannel.num > 0 ? vlchannel.num : "no");
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            document.getElementById("j_vl_channel").style.display = "grid";
            if (Object.keys(vlchannel.users).length > 1 || vlchannel.num === 0) document.getElementById("j_vl_channel_info").innerText += "s";
            if (vlchannel.num == 0) return;
            Object.keys(vlchannel.users).forEach(user => {
                let channelelemtr = document.createElement("tr");
                let channelelemtdname = document.createElement("td");
                let channelelemtdid = document.createElement("td");
                channelelemtr.id = `vl_user_${user}`;

                channelelemtr.classList.add("j_table_tr", "j_table_tr_single");

                channelelemtdname.innerText = vlchannel.users[user].name;
                channelelemtdid.innerText = user;

                [channelelemtdname, channelelemtdid].forEach(a => {
                    a.classList.add("j_table_td", "cursor-copy");
                    a.onclick = () => { copy(a) };
                    a.innerHTML = `<j_h>${a.innerText}</j_h>`;
                    channelelemtr.appendChild(a);
                });
                document.getElementById("j_table").appendChild(channelelemtr);
            });

            document.getElementById("j_table_div").style.display = "block";
        });
    };

    static main = () => {
        request(apiurl(`/viplookup`), (e, r) => {
            if (e) return error(e);

            let vldata = r.data;
            document.getElementById("j_vl_channels_number").innerText = vldata.channels;
            document.getElementById("j_vl_users_number").innerText = vldata.users;
            document.getElementById("j_vl").style.display = "grid";
        });
    };
};

class admin {
    static load = () => {
        if (!auth().parsed) {
            progress(-1);
            document.getElementById("_login").style.display = "block";
            if (interval) clearInterval(interval);
            return;
        };

        fetch(`${api_url}/admin`, { headers: { "auth": auth().auth }, method: "GET" })
            .then(async req => {
                let dat_ = await req.json();

                if (dat_.status !== 200) {
                    requests_failed++;

                    switch (dat_.status) {
                        case 401: {
                            document.getElementById("_noperm").style.display = "grid";
                            break;
                        };
                        default: {
                            document.getElementById("_admin").style.display = "none";
                            error(dat_);
                        };
                    };

                    if (interval && requests_failed > 1) clearInterval(interval);

                    return;
                } else {
                    document.getElementById("_admin").style.display = "grid";
                };

                let dat = dat_.data;

                if (devMode) console.debug("api response", dat);

                let tables = {
                    "0": {
                        "names": [
                            "Channels",
                            "Logchannels",
                            "Discordservers",
                            "CPU Usage",
                            "Memory Usage",
                            "Total Memory Usage"
                        ],
                        "keypaths": [
                            ["channels"],
                            ["logchannels"],
                            ["discordservers"],
                            ["@@progress", "cpu", "usedpercent"],
                            ["@@progress", "memory", "process", "usedpercent"],
                            ["@@progress", "memory", "os", "usedpercent"]
                        ]
                    },
                    "1": {
                        "names": [
                            "",
                            "Uptime",
                            "",
                            "",
                            "Channels",
                            "Users"
                        ],
                        "keypaths": [
                            "@@thOS",
                            ["uptime", "parsed", "os"],
                            "",
                            "@@thModlookup",
                            ["modlookup", "channels"],
                            ["modlookup", "users"],
                            "\n",
                            "@@thProcess",
                            ["uptime", "parsed", "process"],
                            "",
                            "@@thViplookup",
                            ["viplookup", "channels"],
                            ["viplookup", "users"],
                            "\n",
                            "@@thDiscord Client",
                            ["uptime", "parsed", "discordclient"],
                            "",
                            "\n",
                            "",
                            "\n",
                            "",
                            "@@thWS Connections",
                            "\n",
                            "@@thClient",
                            ["connections", "client"],
                            "\n",
                            "@@thLogclient",
                            ["connections", "logclient"]
                        ]
                    },
                    "2": {
                        "names": [
                            "",
                            "Handles",
                            "Messages/sec",
                            "Messages/min",
                            "",
                            "Handled Commands",
                            "Commands/sec",
                            "Commands/min"
                        ],
                        "keypaths": [
                            "@@thClient",
                            ["handled", "handledClient"],
                            ["handledSecond", "handledClient"],
                            ["handledMinute", "handledClient"],
                            "",
                            ["handled", "handledClientCommands"],
                            ["handledSecond", "handledClientCommands"],
                            ["handledMinute", "handledClientCommands"],
                            "\n",
                            "@@thLogclient",
                            ["handled", "handledLog"],
                            ["handledSecond", "handledLog"],
                            ["handledMinute", "handledLog"],
                            "",
                            "",
                            "",
                            "\n",
                            "@@thDiscord Client",
                            ["handled", "handledDiscord"],
                            ["handledSecond", "handledDiscord"],
                            ["handledMinute", "handledDiscord"],
                            "",
                            ["handled", "handledDiscordCommands"],
                            ["handledSecond", "handledDiscordCommands"],
                            ["handledMinute", "handledDiscordCommands"]
                        ]
                    },
                    "3": {
                        "names": [
                            "",
                            "Handles",
                            "Requests/sec",
                            "Requests/min"
                        ],
                        "keypaths": [
                            "@@thWebsite",
                            ["handled", "handledWebsiteRequests"],
                            ["handledSecond", "handledWebsiteRequests"],
                            ["handledMinute", "handledWebsiteRequests"],
                            "\n",
                            "@@thAPI",
                            ["handled", "handledAPIRequests"],
                            ["handledSecond", "handledAPIRequests"],
                            ["handledMinute", "handledAPIRequests"]
                        ]
                    }
                };

                createTable(tables, dat, "_admin_table", "_admin_body", "_admin_progress", ["_admin_progress"])

                let log_elem = document.getElementById("_admin_log");
                log_elem.value = "";

                Object.keys(dat.logs.all).reverse().forEach(a => {
                    log_elem.value = `${dat.logs.all[a][2]} ${dat.logs.all[a][1]}\n${log_elem.value}`;
                });

                if (isFirst) {
                    progress(100);
                    log_elem.scrollTop = log_elem.scrollHeight;
                };

                isFirst = false;
            })
            .catch(e => {
                requests_failed++;
                error(e);
                document.getElementById("_admin").style.display = "none";
                if (interval && requests_failed > 1) clearInterval(interval);
                return;
            });
    };

    static blacklist = class {
        static load = () => {
            request(apiurl("/blacklist"), {
                headers: {
                    auth: auth().auth
                }
            }, (e, r) => {
                if (e) return error(e);

                let dat = r.data;
                document.getElementById("_admin").style.display = "block";

                if (devMode) console.debug("blacklist load", dat);

                // let blacklist_elem = document.querySelector("#_admin_blacklist");

                let tables = {
                    "0": {
                        "names": [
                            "Username",
                            "User ID",
                            "Blacklisted by Username",
                            "Blacklisted by User ID",
                            ""
                        ],
                        "keypaths": []
                    }
                };

                Object.keys(dat.blacklist).forEach(a => {
                    let unblacklistbutton = document.createElement("button");
                    unblacklistbutton.innerText = "Un-Blacklist";
                    unblacklistbutton.classList.add("bg-green");
                    unblacklistbutton.onclick = () => {
                        this.unblacklist(a, unblacklistbutton.parentNode.parentNode.parentNode);
                    };

                    let b = dat.blacklist[a];
                    tables[0].keypaths.push(...[b.name, a, b.editUserName, b.editUser, ["@@html", unblacklistbutton], "\n"])
                });

                createTable(tables, dat, "_admin_blacklist_table", "_admin_blacklist_body", "_admin_blacklist_progress", ["_admin_blacklist_progress"])
            });
        };

        static unblacklist = (user, elem) => {
            request(apiurl("/blacklist"), {
                headers: {
                    auth: auth().auth,
                    user: user
                },
                method: "DELETE"
            }, (e, r) => {
                if (e) return error(e);

                let dat = r.data;

                if (devMode) console.debug("blacklist delete", dat);

                elem?.remove();
            });
        };
    };
};

class channelsuggestion {
    suggestiondata;
    isadmin = Boolean();

    static load = () => {
        if (!auth().parsed) {
            progress(-1);
            document.getElementById("_login").style.display = "block";
            return;
        };

        request(apiurl("/suggestchannel"), {
            headers: {
                "auth": auth().auth
            },
            method: "GET"
        }, (e, dat_) => {
            if (e) return error(e);

            if (devMode) console.debug("get", dat_);

            if (dat_.status !== 200) {
                switch (dat_.status) {
                    default: {
                        error(dat_);
                    };
                };

                return;
            };

            let dat = dat_.data;
            this.suggestiondata = dat;

            document.getElementById("_suggestchannel").style.display = "block";

            if (dat.isAdmin) {
                Object.keys(dat.handledchannels).sort((a, b) => { return dat.handledchannels[a].status - dat.handledchannels[b].status }).forEach(a => this.appendSuggestionAdmin(dat.handledchannels[a], "_suggestchannel_admin_table_2"));
                Object.keys(dat.suggestedchannels).sort((a, b) => { return dat.suggestedchannels[a].status - dat.suggestedchannels[b].status }).forEach(a => this.appendSuggestionAdmin(dat.suggestedchannels[a]));

                if (Object.keys(dat.suggestedchannels).length === 0) {
                    document.getElementById("_suggestchannel_admin_table").style.display = "none";
                    document.getElementById("_suggestchannel_admin_h").innerText = "You're all caught up - No Pending Suggestions found";
                    document.getElementById("_suggestchannel_admin_h").style.display = "block";
                } else {
                    document.getElementById("_suggestchannel_admin").style.display = "block";
                    document.getElementById("_suggestchannel_admin_num").innerText = Object.keys(dat.suggestedchannels).length;
                };

                if (Object.keys(dat.handledchannels).length === 0) {
                    document.getElementById("_suggestchannel_admin_2").style.display = "none";
                } else {
                    document.getElementById("_suggestchannel_admin_2").style.display = "block";
                }
            } else {
                if (Object.keys(dat.suggestedchannels).length === 0) {
                    document.getElementById("_suggestchannel_table").style.display = "none";
                    document.getElementById("_suggestchannel_h").innerText = "No Suggestions found.. yet";
                    document.getElementById("_suggestchannel_h").style.display = "block";
                } else {
                    document.getElementById("_suggestchannel_div").style.display = "block";
                    console.log(dat.suggestedchannels)
                    Object.keys(dat.suggestedchannels).forEach(a => {
                        this.appendSuggestion(dat.suggestedchannels[a]);
                    });
                };
            };

            if (isFirst) {
                isFirst = false;
                progress(100);
            };
        })
    };

    static submit = (channel) => {
        channel = (channel ?? document.getElementById("_suggestchannel_input").value);

        if (channel.length === 0) return error(Error("No channel provided"));
        progress(50);

        request(apiurl("/suggestchannel"), {
            headers: {
                "auth": auth().auth,
                "channel": channel
            },
            method: "POST"
        }, (e, dat_) => {
            if (e) return error(e);

            if (devMode) console.debug("submit", dat_);

            if (dat_.status !== 200) {
                switch (dat_.status) {
                    default: {
                        error(dat_);
                    };
                };
                return;
            };

            let dat = dat_.data;

            this.suggestiondata.suggestedchannels[dat.suggestedchannel._user.id] = dat.suggestchannel;

            document.getElementById("_suggestchannel_submit").classList.add("copied");
            document.getElementById("_suggestchannel_input").value = "";
            notification(`Successfully submitted channel`);
            progress(100);

            _sleep(2000)
                .then(() => {
                    document.getElementById("_suggestchannel_submit").classList.remove("copied");
                })

            this.appendSuggestion(dat.suggestedchannel);
        });
    };

    static submitAdmin = (channel, status) => {
        channel = (channel ?? document.getElementById("_suggestchannel_input").value);

        if (channel.length === 0) return error("No channel provided");
        progress(50);

        request(apiurl("/suggestchannel"), {
            headers: {
                "auth": auth().auth,
                "channel": channel,
                "channelstatus": status
            },
            method: "PATCH"
        }, (e, dat_) => {
            if (e) return error(e);

            if (devMode) console.debug("submitAdmin", dat_);

            if (dat_.status !== 200) {
                switch (dat_.status) {
                    default: {
                        error(dat_);
                    };
                };
                return;
            };

            let dat = dat_.data;

            progress(100);

            let removingelem = document.getElementById(`_suggestchannel_${channel}`);
            removingelem.parentNode.appendChild(removingelem);
            removingelem.remove();
            try { delete this.suggestiondata.suggestedchannels[channel]; } catch (e) { error(e) };

            if (Object.keys((this.suggestiondata?.suggestedchannels ?? {})).length === 0) {
                document.getElementById("_suggestchannel_admin").style.display = "none";
                document.getElementById("_suggestchannel_admin_h").innerText = "You're all caught up - No Pending Suggestions found";
                document.getElementById("_suggestchannel_admin_h").style.display = "block";
            };
        });
    };

    static appendSuggestion = (suggestion) => {
        let suggestionelem = document.createElement("tr");
        suggestionelem.classList.add("j_table_tr", "border_white", "j_table-hasval");
        suggestionelem.id = `_suggestchannel_${suggestion._user.id}`;

        let suggestionelem_name = document.createElement("td");
        let suggestionelem_id = document.createElement("td");
        let suggestionelem_status = document.createElement("td");

        suggestionelem_name.innerText = suggestion._user.login;
        suggestionelem_id.innerText = suggestion._user.id;
        suggestionelem_status.innerText = suggestion.status_name;

        [suggestionelem_name, suggestionelem_id, suggestionelem_status].forEach((a, i) => {
            a.classList.add(`_suggestchannel_${suggestion._user.id}`, "_table_width_33", "j_table_td");
            a.id = `_suggestchannel_${suggestion._user.id}_${["name", "id", "status"][i]}`;
            suggestionelem.appendChild(a);
            if (i < 3) {
                a.classList.add("cursor-copy");
                a.onclick = () => { copy(a) };
            };
        });

        document.getElementById("_suggestchannel_table").appendChild(suggestionelem);
    };

    static appendSuggestionAdmin = (suggestion, tableid) => {
        let suggestionelem = document.createElement("tr");
        suggestionelem.classList.add("j_table_tr", "border_white");
        suggestionelem.id = `_suggestchannel_${suggestion._user.id}`;

        let suggestionelem_name = document.createElement("td");
        let suggestionelem_id = document.createElement("td");
        let suggestionelem_type = document.createElement("td");
        let suggestionelem_users = document.createElement("td");
        let suggestionelem_status = document.createElement("td");
        let suggestionelem_actions = document.createElement("td");

        suggestionelem_name.innerText = suggestion._user.login;
        suggestionelem_id.innerText = suggestion._user.id;
        suggestionelem_type.innerText = (suggestion._user.type?.length > 0 ? suggestion._user.type : "");
        suggestionelem_type.classList.add(...(suggestion._user.type?.length > 0 ? ["bg-yellow"] : ["noborder", "bg-transparent", "j_table-noval"]));
        suggestionelem_users.innerText = suggestion.first_user + (Object.keys(suggestion.users).length > 1 ? ` +${Object.keys(suggestion.users).length - 1}` : "");

        let suggestion_approve = document.createElement("button");
        let suggestion_deny = document.createElement("button");
        let suggestion_blacklist = document.createElement("button");

        let this_ = this;
        suggestion_approve.innerText = "Approve";
        suggestion_approve.classList.add("bg-green");
        suggestion_approve.onclick = () => { this_.submitAdmin(suggestion._user.id, 1); suggestionelem_status.innerText = "Approved"; suggestionelem_status.classList.add("bg-green"); };
        suggestion_deny.innerText = "Deny";
        suggestion_deny.classList.add("bg-red");
        suggestion_deny.onclick = () => { this_.submitAdmin(suggestion._user.id, 2); suggestionelem_status.innerText = "Denied"; suggestionelem_status.classList.add("bg-red"); };
        suggestion_blacklist.innerText = "Blacklist";
        suggestion_blacklist.classList.add("bg-red");
        suggestion_blacklist.onclick = () => { this_.submitAdmin(suggestion._user.id, 3); suggestionelem_status.innerText = "Blacklisted"; suggestionelem_status.classList.add("bg-red"); }

        suggestionelem_actions.style.width = "20%";
        suggestionelem_actions.style.padding = "3px";

        [suggestion_approve, suggestion_deny, suggestion_blacklist].forEach(a => {
            // a.style.width = "30%";
            a.style.marginLeft = a.style.marginRight = "1px";
            suggestionelem_actions.appendChild(a);
        });

        const suggestionnames = ["Pending", "Approved", "Denied", "Blacklisted"];

        suggestionelem_status.innerText = suggestionnames[suggestion.status];
        suggestionelem_status.classList.add((suggestion.status == 1 ? "bg-green" : ([2, 3].includes(suggestion.status) ? "bg-red" : "bg-yellow")));

        [suggestionelem_name, suggestionelem_id, suggestionelem_type, suggestionelem_users, suggestionelem_status, suggestionelem_actions].forEach((a, i) => {
            a.classList.add(`_suggestchannel_${suggestion._user.id}`);
            a.id = `_suggestchannel_${suggestion._user.id}_${["name", "id", "users_num", "select", "submit"][i]}`;
            a.classList.add((a.innerText.length > 0 ? "j_table-hasval" : "j_table-noval"));
            if (i < 5 && a.innerText.length > 0) {
                a.classList.add("cursor-copy");
                a.onclick = () => {
                    if (i == 3) copy(a, suggestion.users.join(", ")); else copy(a);
                };
            };
            a.classList.add("j_table_td")
            suggestionelem.appendChild(a);
        });

        document.getElementById((tableid ?? "_suggestchannel_admin_table")).appendChild(suggestionelem);
    };

    static reload = () => {
        [...document.querySelectorAll("#_suggestchannel_admin_table tr")].slice(1).forEach(a => a.remove());
        [...document.querySelectorAll("#_suggestchannel_admin_table_2 tr")].slice(1).forEach(a => a.remove());
        [...document.querySelectorAll("#_suggestchannel_table tr")].slice(1).forEach(a => a.remove());

        this.load();
    };

    static blacklist = (ch) => {
        request(apiurl("/suggestchannel"), {
            headers: {
                auth: auth().auth,
                channel: ch,
                channelstatus: 3
            }
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            if (devMode) console.debug("blacklist", dat);
        });
    };
};

class dashboard {
    dashboardData = {};

    static load = () => {
        if (!auth().parsed) {
            progress(-1);
            document.getElementById("_login").style.display = "block";
            return;
        };

        request(apiurl("/dashboard"), {
            headers: {
                auth: auth().auth
            }
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            if (devMode) console.debug("dash", dat);

            this.dashboardData = dat;

            let dashboard_elem = document.querySelector("#_dashboard");
            dashboard_elem.style.width = "80%";

            let prefix_elem = document.createElement("div");
            let prefix_elem_input = document.createElement("input");
            let prefix_elem_update = document.createElement("button");
            let prefix_elem_reset = document.createElement("button");
            let botstatus_elem = document.createElement("div");
            let botstatus_elem_h = document.createElement("j_h");
            let botstatus_elem_button = document.createElement("button");
            let removelog_elem_button = document.createElement("button");

            removelog_elem_button.innerText = "Remove from logs";
            removelog_elem_button.classList.add("bg-red");
            removelog_elem_button.onclick = () => {
                this.removelogs();
            };

            if (dat.bot) {
                botstatus_elem.id = "_dash_status";
                botstatus_elem.classList.add((dat.bot.inChannel ? "bg-green" : "bg-red"), "_width-100");

                botstatus_elem_h.id = "_dash_status_h";
                botstatus_elem_h.innerText = (dat.bot.inChannel ? `Bot in channel` : "Bot not in channel");

                botstatus_elem_button.id = "_dash_status_button";
                botstatus_elem_button.innerText = (dat.bot.inChannel ? "Part" : "Join");
                botstatus_elem_button.classList.add((dat.bot.inChannel ? "bg-red" : "bg-green"), "_dash_status_button");
                botstatus_elem_button.onclick = async () => {
                    if (this.dashboardData.bot.inChannel) {
                        this.partChannel(auth().parsed.user_id);
                    } else {
                        this.joinChannel(auth().parsed.user_id);
                    }
                };

                [botstatus_elem_h, br].forEach(a => {
                    botstatus_elem.appendChild(a);
                });

                prefix_elem_input.id = "j_dash_prefix_input";
                prefix_elem_input.value = (dat.bot.prefix ?? "");
                prefix_elem_input.placeholder = dat.bot.defaultPrefix;

                let this_ = this;

                prefix_elem.appendChild(prefix_elem_input);

                prefix_elem_update.classList.add("bg-green");
                prefix_elem_update.innerText = "Update";
                prefix_elem_update.onclick = () => {
                    if (!(prefix_elem_input.value ?? undefined)) return error("Prefix input is empty");
                    if ((prefix_elem_update.value ?? undefined) === (this.dashboardData.bot.prefix ?? this.dashboardData.bot.defaultPrefix)) return error("Prefix unchanged");
                    this_.editKey("prefix", prefix_elem_input.value);
                };

                prefix_elem_reset.classList.add("bg-red");
                prefix_elem_reset.innerText = "Reset";
                prefix_elem_reset.onclick = () => {
                    if (!(prefix_elem_input.value ?? undefined)) return error("Prefix unchanged");
                    this_.editKey("prefix", "");
                    prefix_elem_input.value = "";
                };

                [prefix_elem_update, prefix_elem_reset].forEach(a => {
                    a.classList.add("_dash_prefix_button");
                });
            };

            document.getElementById("_logging_opted_out").classList.add("bg-red");
            document.getElementById("_logging_opted_out").innerHTML = "<h>You have been opted out from logging. You cannot undo this by yourself.</h><br><h>If you want to get removed from the blacklist, write me a nice message via one of in the footer displayed options</h>";
            if (!dat.inBlacklist) {
                document.getElementById("_logging_opted_out").style.display = "none";
            };

            let table1 = {
                "0": {
                    "names": [
                        "Status",
                        "Prefix"
                    ],
                    "keypaths": [
                        "\n",
                        ["@@html", botstatus_elem],
                        ["@@html", prefix_elem],
                        // ["@@html", prefix_elem, prefix_elem_update, prefix_elem_reset],
                        "\n",
                        ["@@html", botstatus_elem_button],
                        ["@@html", prefix_elem_update, prefix_elem_reset],
                    ]
                }
            };

            let table2 = {
                "1": {
                    "names": [
                        "Remove from Logs"
                    ],
                    "keypaths": [
                        ["@@nocopy", "By clicking the button down below, you opt yourself out of any kind of logging, that includes your channel and you in other channels"],
                        "\n",
                        ["@@nocopy", "All your existing data will be deleted and you will be permanently blacklisted"],
                        "\n",
                        ["@@nocopy", "Warning: This cannot be undone - If you want to get removed from the blacklist, write me a nice message via one of in the footer displayed options"],
                        "\n",
                        ["@@html", removelog_elem_button]
                    ]
                }
            };

            createTable(table1, dat, "_dash_table", "_dashboard");
            createTable(table2, dat, "_dash_table2", "_dashboard");

            if (dat.inBlacklist) {
                document.getElementById("_dash_table2_0").style.display = "none";
                document.getElementById("_logging_opted_out").style.display = "block";
            };
        });
    };

    static editKey = (key, value) => {
        request(apiurl("/channel"), {
            headers: {
                auth: auth().auth,
                key: key,
                value: value
            },
            method: "POST"
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            notification(dat.message);

            if (key == "prefix") {
                if (this.dashboardData?.bot?.prefix) this.dashboardData.bot.prefix = value;
                if (!(value ?? undefined)) {
                    document.getElementById("j_dash_prefix_input").value = "";
                }
            };
        });
    };

    static joinChannel = (ch) => {
        request(apiurl("/join"), {
            headers: {
                auth: auth().auth,
                channel: ch
            },
            method: "POST"
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            if (devMode) console.debug("join", dat);

            document.getElementById("_dash_status_h").innerText = "Bot in channel";
            document.getElementById("_dash_status_button").classList.replace("bg-green", "bg-red");
            document.getElementById("_dash_status_button").innerText = "Part";
            document.getElementById("_dash_status").classList.replace("bg-red", "bg-green");
            this.dashboardData.bot.inChannel = true;
        });
    };

    static partChannel = (ch) => {
        request(apiurl("/part"), {
            headers: {
                auth: auth().auth,
                channel: ch
            },
            method: "POST"
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            if (devMode) console.debug("part", dat);

            document.getElementById("_dash_status_h").innerText = "Bot not in channel";
            document.getElementById("_dash_status_button").classList.replace("bg-red", "bg-green");
            document.getElementById("_dash_status_button").innerText = "Join";
            document.getElementById("_dash_status").classList.replace("bg-green", "bg-red");
            this.dashboardData.bot.inChannel = true;
        });
    };

    static removelogs = () => {
        request(apiurl("/blacklist"), {
            headers: {
                auth: auth().auth,
                user: auth().parsed.user_id
            },
            method: "POST"
        }, (e, r) => {
            if (e) return error(e);

            let dat = r.data;

            if (devMode) console.debug("removelogs", dat);

            document.getElementById("_dash_table2_0").style.display = "none";
            document.getElementById("_logging_opted_out").style.display = "block";
        });
    };
};

function autoexec() {
    autoexecs++;

    switch (currentendpointpath) {
        case "/modlookup":
        case "/modlookup/": {
            ml.main(); break;
        };

        case "/modlookup/users":
        case "/modlookup/users/": {
            ml.users(); break;
        };

        case "/modlookup/channels":
        case "/modlookup/channels/": {
            ml.channels(); break;
        };

        case "/modlookup/channel": {
            let currentinput = (document.getElementById('ml_channel_input')?.value?.length > 0 ? document.getElementById('ml_channel_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('ml_channel_input')?.value?.length > 0) redirectSelf(siteurl('/modlookup/channel/' + document.getElementById('ml_channel_input').value))
            if (currentinput) ml.channel(currentinput); else progress(-1); break;
        };

        case "/modlookup/user": {
            let currentinput = (document.getElementById('ml_user_input')?.value?.length > 0 ? document.getElementById('ml_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('ml_user_input')?.value?.length > 0) redirectSelf(siteurl('/modlookup/user/' + document.getElementById('ml_user_input').value))
            if (currentinput) ml.user(currentinput); else progress(-1); break;
        };


        case "/viplookup":
        case "/viplookup/": {
            vl.main(); break;
        };

        case "/viplookup/users":
        case "/viplookup/users/": {
            vl.users(); break;
        };

        case "/viplookup/channels":
        case "/viplookup/channels/": {
            vl.channels(); break;
        };

        case "/viplookup/channel": {
            let currentinput = (document.getElementById('vl_channel_input')?.value?.length > 0 ? document.getElementById('vl_channel_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('vl_channel_input')?.value?.length > 0) redirectSelf(siteurl('/viplookup/channel/' + document.getElementById('vl_channel_input').value))
            if (currentinput) vl.channel(currentinput); else progress(-1); break;
        };

        case "/viplookup/user": {
            let currentinput = (document.getElementById('vl_user_input')?.value?.length > 0 ? document.getElementById('vl_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('vl_user_input')?.value?.length > 0) redirectSelf(siteurl('/viplookup/user/' + document.getElementById('vl_user_input').value))
            if (currentinput) vl.user(currentinput); else progress(-1); break;
        };


        case "/token/validate": {
            validatetoken(); break;
        };

        case "/admin": {
            admin.load();
            interval = setInterval(admin.load, interval_times.admin);
            break;
        };

        case "/admin/blacklist": {
            admin.blacklist.load();
            break;
        };

        case "/suggestchannel": {
            if (autoexecs > 1) channelsuggestion.submit(); else channelsuggestion.load();
            if (!devMode) interval = setInterval(channelsuggestion.reload, interval_times.suggestchannel);
            break;
        };

        case "/dashboard": {
            dashboard.load(); break;
        };

        default: {
            progress(-1);
        };
    };
};

function _main_elems() {
    let j_dashboard_elem = document.createElement("button");
    j_dashboard_elem.innerText = "Dashboard";
    j_dashboard_elem.id = "j_dashboard";
    j_dashboard_elem.onclick = () => { redirect(`${url.origin}/dashboard`) };

    document.querySelector("body").appendChild(j_dashboard_elem);

    let j_body_elem = document.querySelector("j_body");
    if (!j_body_elem) return;
    j_body_elem.appendChild(spacer);

    let contact_elem = document.createElement("j_contact");
    let contact_elem_h = document.createElement("j_title");
    contact_elem_h.innerText = "Contact";
    let contact_options = {
        "Discord": {
            "url": "https://discord.com/users/635032637194633229",
            "src": "/html/img/discord.png"
        },
        "Twitch": {
            "url": "https://twitch.tv/jubewe",
            "src": "/html/img/twitch.png"
        }
    };

    contact_elem.appendChild(contact_elem_h);
    contact_elem.appendChild(document.createElement("j_spacer_smol"));

    Object.keys(contact_options).forEach(a => {
        contact_elem.appendChild(document.createElement("j_spacer_inline_smol"));
        let contact_elem_2_div = document.createElement("div");
        contact_elem_2_div.classList.add("j_contact_icon_div");

        let contact_elem_2 = document.createElement("a");
        contact_elem_2.classList.add("j_contact_icon_a");
        let contact_elem_2_img = document.createElement("img");
        contact_elem_2_img.classList.add("j_contact_icon_img")

        contact_elem_2_img.src = contact_options[a].src;
        contact_elem_2.href = contact_options[a].url;

        contact_elem_2.appendChild(contact_elem_2_img);
        contact_elem_2_div.appendChild(contact_elem_2);
        contact_elem.appendChild(contact_elem_2_div);
    });

    [contact_elem, spacer].forEach(a => j_body_elem.appendChild(a));

    let footer_elem = document.createElement("j_footer");
    let footer_elem_h = document.createElement("j_h");
    let footer_elem_host = document.createElement("j_h");
    let footer_elem_icons = document.createElement("j_h");

    footer_elem_h.innerHTML = "This page was made with <h class='fontkindaverysmollol'></h> Love by <a href='https://twitch.tv/jubewe'>Jubewe</a><br>";
    footer_elem_host.innerHTML = `<h class='fontsmol'>Hosted by <h class='url' onclick="redirect('https://dau8er.github.io/')">DAU8ER</h></h><br>`;
    footer_elem_icons.innerHTML = `<h class='fontsmol'>Discord- and Twitch Icon by <h class='url' onclick="redirect('https://icons8.com')">icons8.com</h></h>`;

    [footer_elem_h, footer_elem_host, footer_elem_icons].forEach(a => footer_elem.appendChild(a));

    j_body_elem.appendChild(footer_elem);

    if (icon_elems[0]) {
        icon_elems[0].classList.add("cursor-pointer");
        // icon_elems[0].classList.add(_pickrandom("j_icon", "j_icon-vrr"))

        icon_elems[0].onclick = () => { redirectSelf(url.origin) };
    };

    if (login_elem) {
        if (localStorage.getItem("auth")) {
            login_elem.innerText = "Logout";
            login_elem.onclick = () => { logout() };
        };
    };

    if (notification_elem) {
        let notification_elem_h = document.createElement("h");
        notification_elem_h.id = "j_notification";
        notification_elem.appendChild(notification_elem_h);
    };

    if (pagename_elem) pagename_elem.innerText = currentendpointpath.split("/").slice(1).map(a => a[0].toUpperCase() + a.slice(1)).join("/");

    // if(icon_elems[0]) {
    //     icon_elems[0].onclick = () => {
    //         if(icon_elems[0].classList.contains("j_icon")){
    //             icon_elems[0].classList.replace("j_icon", "j_icon_vrr");
    //         } else {
    //             icon_elems[0].classList.replace("j_icon_vrr", "j_icon");
    //         }
    //     }
    // }
};

progress(25);
window.onload = () => { autoexec(); _main_elems(); };

window.addEventListener("keypress", ev => {
    switch (ev.key) {
        case "Enter": {
            autoexec(); break;
        };
    };
});