const url = new URL(document.baseURI).origin;
const api_url = (url.split(".")[0].split("-dest")[0] + "-api" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));
const ws_url = (url.split(".")[0].split("-dest")[0] + "-ws" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));
function apiurl(u) { return api_url + (!u.startsWith("/") ? "/" : "") + (u) };
function siteurl(u) { return url + (!u.startsWith("/") ? "/" : "") + (u) };
function redirect(url) { window.open(url, "_self") };
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
let page_data = {};
let devMode = false;

function progress(num) {
    const progress_elem = document.getElementById("j_progress");

    const num_ = (num > 0 && num < 1 ? num * 100 : num);

    if (num_ < 100) progress_elem.classList.replace("progress_load_end", "progress_load");
    if (num_ === 100) progress_elem.classList.replace("progress_load", "progress_load_end");

    setTimeout(() => {
        progress_elem.style.display = (num > 0 && num < 100 ? "grid" : "none");
    }, (num > 0 && num < 100 ? 0 : 1500))
    progress_elem.value = num_;
};

function notification(message, timeout) {
    const notification_elem = document.querySelector("j_notification");
    if (!document.querySelector("j_notification div")) notification_elem.appendChild(document.createElement("div"));

    const notification_elem_text = document.querySelector("j_notification div");
    let add_classes = [];

    let iserror = (message instanceof Error || (message?.error ?? message?.error));

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

let error = notification;

function request(url, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }
    progress(0);

    fetch(url, options)
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
    fetch(`${api_url}/validatetoken`, { headers: { "authorization": token } })
        .then(async req => {
            let res = await req.json();
            console.log(`Successfully authorized`)
            localStorage.setItem("auth", JSON.stringify(res.data));
            window.close();
        })
        .catch(e => {
            error(e);
        });
};

function login() {
    window.open(`https://id.twitch.tv/oauth2/authorize?client_id=1pnta1kpjqm4xth9e60czubvo1j7af&redirect_uri=${url}/validatetoken&scope=&response_type=token`, "_blank");
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

    fetch(`${api_url}/revoketoken`, {
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

function _sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, (time ?? 1000)));
};

function loadadmin() {
    let isFirst = (interval ?? undefined);

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
                        "@@thClient (WS)",
                        ["uptime", "parsed", "clientws"],
                        "",
                        "",
                        "",
                        "\n",
                        "@@thLogclient (WS)",
                        ["uptime", "parsed", "logclientws"],
                        "",
                        "",
                        "",
                        "\n",
                        "@@thDiscord Client",
                        ["uptime", "parsed", "discordclient"],
                        "",
                        "",
                        ""
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

            Object.keys(tables).forEach((a, i) => {
                if (document.getElementById(`_admin_table_${i}`) === null) {
                    let table_elem = document.createElement("table");
                    table_elem.id = `_admin_table_${i}`;
                    table_elem.classList.add("j_table", "_admin_table");

                    let th_tr_elem = document.createElement("tr");
                    let tr_elem = document.createElement("tr");
                    tr_elem.id = `_admin_table_${i}_tr_0`;
                    tr_elem.classList.add(`_admin_table_${i}_tr`);

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

                    document.getElementById("_admin_body").appendChild(table_elem);
                };

                let tabletr = document.getElementById(`_admin_table_${i}_tr_0`);
                let key_elem_index = 0;

                tables[a].keypaths.forEach((b, i2) => {
                    let key_elem_id = `_admin_table_${i}_td_${i2}`;
                    let key_elem_val_id = `_admin_table_${i}_td_${i2}_val`;
                    let key_elem_progress_id = `_admin_table_${i}_td_${i2}_progress`;

                    let iab = Array.isArray(b);
                    let isProgress = (iab && b[0] === "@@progress"); if (isProgress) b = b.slice(1);
                    let skipVal = (iab && b[0] === "@@skipval"); if (skipVal) b = b.slice(1);
                    let isTH = (!iab && b.startsWith("@@th")); if (isTH) b = b.replace("@@th", "");

                    let val = (!iab ? b : getKeyFromObject(dat, b));

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
                        tabletr.classList.add(`_admin_table_${i}_tr`);

                        document.getElementById(`_admin_table_${i}`).appendChild(tabletr);
                    } else {
                        if (document.getElementById(key_elem_id) === null) {
                            let key_elem = document.createElement((isTH ? "th" : "td"));
                            key_elem.classList.add("j_table_td", "_admin_table_td", `_admin_table_${i}_td`, `_admin_table_td_${key_elem_index}`, `_admin_table_${i}_td_${key_elem_index}`);
                            key_elem.id = key_elem_id;

                            if ((val_?.toString()?.length ?? 0) === 0) {
                                key_elem.classList.add("noborder", "j_table-noval");
                            } else {
                                key_elem.classList.add("j_table-hasval");
                            };

                            let key_elem_val = document.createElement("h");
                            key_elem_val.id = key_elem_val_id;
                            key_elem_val.classList.add(`_admin_val`, `_admin_table_${i}_val`);
                            if (!skipVal) key_elem_val.innerText = val_;

                            if (isTH) {
                                key_elem.classList.add("j_table-title");
                            };

                            key_elem.appendChild(key_elem_val);

                            if (isProgress) {
                                let progress_elem = document.createElement("progress");
                                progress_elem.max = 100;
                                progress_elem.value = val;
                                progress_elem.classList.add("_admin_progress");
                                progress_elem.id = key_elem_progress_id;

                                key_elem.classList.add("_admin_progress_parent");
                                key_elem.appendChild(progress_elem);
                            };

                            tabletr.appendChild(key_elem);
                        } else if (isProgress && document.getElementById(`${key_elem_id}_progress`) !== null) {
                            document.getElementById(`${key_elem_id}_progress`).value = val;
                            document.getElementById(key_elem_val_id).innerText = val_;
                        } else {
                            document.getElementById(key_elem_val_id).innerText = val_;
                        };

                        key_elem_index++;
                    };
                });
            });

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

async function copy() {
    navigator.clipboard.writeText((["string", "number"].includes(arguments[0]) ? arguments[0] : (arguments[0].value ?? arguments[0].innerText ?? arguments[0])));
    if (!arguments[0].innerText && (!arguments[1] || (document.getElementById(arguments[1]) === null))) return;
    let element = (arguments[0].innerText ? arguments[0] : document.getElementById(arguments[1]));
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

            console.debug("user", r);
            let mluser = r.data;
            document.getElementById("j_ml_user_user").innerText = `${mluser.name} (${mluser.id})`;
            document.getElementById("j_ml_user_channels_number").innerText = mluser.num;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(mluser.channels).length > 1) document.getElementById("j_ml_user_info").innerText += "s";

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

            document.getElementById("j_ml_user").style.display = "grid";
        });
    };

    static channel = (channel) => {
        request(apiurl(`/modlookup/channel/${channel}`), (e, r) => {
            if (e) return error(e);

            if (devMode) console.debug("channel", r);
            let mlchannel = r.data;
            document.getElementById("j_ml_channel_channel").innerText = `${mlchannel.name} (${mlchannel.id})`;
            document.getElementById("j_ml_channel_users_number").innerText = mlchannel.num;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(mlchannel.users).length > 1) document.getElementById("j_ml_channel_info").innerText += "s";
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

            document.getElementById("j_ml_channel").style.display = "grid";
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

            console.debug("user", r);
            let vluser = r.data;
            document.getElementById("j_vl_user_user").innerText = `${vluser.name} (${vluser.id})`;
            document.getElementById("j_vl_user_channels_number").innerText = vluser.num;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(vluser.channels).length > 1) document.getElementById("j_vl_user_info").innerText += "s";
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

            document.getElementById("j_vl_user").style.display = "grid";
        });
    };

    static channel = (channel) => {
        request(apiurl(`/viplookup/channel/${channel}`), (e, r) => {
            if (e) return error(e);

            console.debug("channel", r);
            let vlchannel = r.data;
            document.getElementById("j_vl_channel_channel").innerText = `${vlchannel.name} (${vlchannel.id})`;
            document.getElementById("j_vl_channel_users_number").innerText = vlchannel.num;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(vlchannel.users).length > 1) document.getElementById("j_vl_channel_info").innerText += "s";
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

            document.getElementById("j_vl_channel").style.display = "grid";
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

class channelsuggestion {
    suggestiondata;
    isadmin = Boolean();

    static load = () => {
        if (!auth().parsed) {
            progress(-1);
            document.getElementById("_login").style.display = "block";
            return;
        };

        fetch(`${api_url}/suggestchannel`, {
            headers: {
                "auth": auth().auth
            },
            method: "GET"
        })
            .then(async req => {
                let dat_ = await req.json();

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

                if (devMode) console.debug(dat);

                document.getElementById("_suggestchannel").style.display = "block";

                if (dat.isAdmin) {
                    if (Object.keys(dat.suggestedchannels).length === 0) {
                        document.getElementById("_suggestchannel_admin_table").style.display = "none";
                        document.getElementById("_suggestchannel_admin_h").innerText = "You're all caught up - No Pending Suggestions found";
                        document.getElementById("_suggestchannel_admin_h").style.display = "block";
                    } else {
                        document.getElementById("_suggestchannel_admin").style.display = "block";
                        Object.keys(dat.suggestedchannels).forEach(a => this.appendSuggestionAdmin(dat.suggestedchannels[a]));
                    };
                } else {
                    if (Object.keys(dat.suggestedchannels).length === 0) {
                        document.getElementById("_suggestchannel_table").style.display = "none";
                        document.getElementById("_suggestchannel_h").innerText = "No Suggestions found.. yet";
                        document.getElementById("_suggestchannel_h").style.display = "block";
                    } else {
                        document.getElementById("_suggestchannel_div").style.display = "block";
                        Object.keys(dat.suggestedchannels).forEach(a => {
                            this.appendSuggestion(dat.suggestedchannels[a]);
                        });
                    };
                };
            });
    };

    static submit = (channel) => {
        channel = (channel ?? document.getElementById("_suggestchannel_input").value);

        if (channel.length === 0) return error(Error("No channel provided"));

        fetch(apiurl("/suggestchannel"), {
            headers: {
                "auth": auth().auth,
                "suggestchannel": channel
            },
            method: "POST"
        })
            .then(async req => {
                let dat_ = await req.json();

                if (dat_.status !== 200) {
                    switch (dat_.status) {
                        default: {
                            error(dat_);
                        };
                    };
                    return;
                };

                let dat = dat_.data;

                if (devMode) console.debug(dat);

                this.suggestiondata.suggestedchannels[dat.suggestedchannel._user.id] = dat.suggestchannel;

                document.getElementById("_suggestchannel_submit").classList.add("copied");
                document.getElementById("_suggestchannel_input").value = "";
                notification(`Successfully submitted channel`);

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

        request(apiurl("/suggestchannel"), {
            headers: {
                "auth": auth().auth,
                "suggestchannel": channel,
                "suggestchannel_status": status
            },
            method: "PATCH"
        }, async (e, r) => {
            if (e) return error(e);

            let dat_ = JSON.parse(r.body);

            if (dat_.status !== 200) {
                switch (dat_.status) {
                    default: {
                        error(dat_);
                    };
                };
                return;
            };

            let dat = dat_.data;

            if (devMode) console.debug(dat);

            document.getElementById(`_suggestchannel_${channel}`).remove();
            delete this.suggestiondata.suggestedchannels[channel];

            if (Object.keys((this.suggestiondata?.suggestedchannels ?? {})).length === 0) {
                document.getElementById("_suggestchannel_admin").style.display = "none";
                document.getElementById("_suggestchannel_admin_h").innerText = "You're all caught up - No Pending Suggestions found";
                document.getElementById("_suggestchannel_admin_h").style.display = "block";
            }
        })
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

    static appendSuggestionAdmin = (suggestion) => {
        let suggestionelem = document.createElement("tr");
        suggestionelem.classList.add("j_table_tr", "border_white", "j_table-hasval");
        suggestionelem.id = `_suggestchannel_${suggestion._user.id}`;

        let suggestionelem_name = document.createElement("td");
        let suggestionelem_id = document.createElement("td");
        let suggestionelem_users_num = document.createElement("td");
        let suggestionelem_select = document.createElement("td");
        let suggestionelem_submit = document.createElement("td");

        suggestionelem_name.innerText = suggestion._user.login;
        suggestionelem_id.innerText = suggestion._user.id;
        suggestionelem_users_num.innerText = suggestion.users.length;

        let suggestion_select = document.createElement("select");
        const suggestionnames = ["Pending", "Approve", "Deny"];
        for (let i = 0; i <= 2; i++) {
            let suggestionoptionelem = document.createElement("option");
            suggestionoptionelem.value = i;
            suggestionoptionelem.innerText = suggestionnames[i];
            suggestion_select.appendChild(suggestionoptionelem);
        };

        suggestionelem_select.appendChild(suggestion_select);

        let suggestion_submit = document.createElement("button");
        suggestion_submit.innerText = "Submit";
        let submitadmin_ = this.submitAdmin;
        suggestion_submit.onclick = () => { submitadmin_(suggestion._user.id, suggestion_select.value) };
        suggestion_submit.classList.add("button_submit");

        suggestionelem_submit.appendChild(suggestion_submit);

        [suggestionelem_name, suggestionelem_id, suggestionelem_users_num, suggestionelem_select, suggestionelem_submit].forEach((a, i) => {
            a.classList.add(`_suggestchannel_${suggestion._user.id}`);
            a.id = `_suggestchannel_${suggestion._user.id}_${["name", "id", "users_num", "select", "submit"][i]}`;
            if (i < 3) {
                a.classList.add("cursor-copy");
                a.onclick = () => {
                    copy(a);
                };
            };
            if (i < 5) a.classList.add("_table_width_23-2", "j_table_td");
            suggestionelem.appendChild(a);
        });

        document.getElementById("_suggestchannel_admin_table").appendChild(suggestionelem);
    };

    static reload = () => {
        [...document.querySelectorAll("#_suggestchannel_admin_table tr")].slice(1).forEach(a => a.remove());
        [...document.querySelectorAll("#_suggestchannel_table tr")].slice(1).forEach(a => a.remove());

        this.load();
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
            if (autoexecs > 1 && document.getElementById('ml_channel_input')?.value?.length > 0) redirect(siteurl('/modlookup/channel/' + document.getElementById('ml_channel_input').value))
            if (currentinput) ml.channel(currentinput); else progress(-1); break;
        };

        case "/modlookup/user": {
            let currentinput = (document.getElementById('ml_user_input')?.value?.length > 0 ? document.getElementById('ml_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('ml_user_input')?.value?.length > 0) redirect(siteurl('/modlookup/user/' + document.getElementById('ml_user_input').value))
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
            if (autoexecs > 1 && document.getElementById('vl_channel_input')?.value?.length > 0) redirect(siteurl('/viplookup/channel/' + document.getElementById('vl_channel_input').value))
            if (currentinput) vl.channel(currentinput); else progress(-1); break;
        };

        case "/viplookup/user": {
            let currentinput = (document.getElementById('vl_user_input')?.value?.length > 0 ? document.getElementById('vl_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('vl_user_input')?.value?.length > 0) redirect(siteurl('/viplookup/user/' + document.getElementById('vl_user_input').value))
            if (currentinput) vl.user(currentinput); else progress(-1); break;
        };


        case "/validatetoken": {
            validatetoken(); break;
        };

        case "/admin": {
            loadadmin();
            interval = setInterval(loadadmin, interval_times.admin);
            break;
        };

        case "/suggestchannel": {
            if (autoexecs > 1) channelsuggestion.submit(); else channelsuggestion.load();
            if (!devMode) interval = setInterval(channelsuggestion.reload, interval_times.suggestchannel);
            break;
        };

        default: {
            progress(-1);
        };
    };
};

if (document.getElementById("j_login")) {
    if (localStorage.getItem("auth")) {
        document.getElementById("j_login").innerText = "Logout";
        document.getElementById("j_login").onclick = logout;
    };
};

progress(0);
autoexec();

window.addEventListener("keypress", ev => {
    switch (ev.key) {
        case "Enter": {
            autoexec(); break;
        };
    };
});