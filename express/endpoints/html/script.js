const url = new URL(document.baseURI).origin;
const api_url = (url.split(".")[0].split("-dest")[0] + "-api" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));
const ws_url = (url.split(".")[0].split("-dest")[0] + "-ws" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));
function apiurl(u) { return api_url + (!u.startsWith("/") ? "/" : "") + (u) };
function siteurl(u) { return url + (!u.startsWith("/") ? "/" : "") + (u) };
function redirect(url) { document.location.replace(url); };
const currentendpoint = document.URL.replace(/http(s)*:\/\/(mod|vip)lookup(-dest)*\.jubewe\.de/g, "");
const currentendpointpath = currentendpoint.split("/").slice(0, 3).join("/").split(/#|\?/)[0];
const currentendpointparts = currentendpoint.split("/").slice(1);
let autoexecs = 0;
let admin_interval;
let page_data = {};
progress(0);

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

function error(error, timeout) {
    console.error(error);
    const error_elem = document.getElementById("j_error");

    error_elem.innerText = `Error: ${(error.error ?? error.message ?? error)}`;
    error_elem.style.display = "grid";

    setTimeout(() => {
        error_elem.style.display = "none";
    }, (timeout ?? 4000));
};

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
            document.getElementById("j_ml_user_channels_number").innerText = Object.keys(mluser.channels).length;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(mluser.channels).length > 1) document.getElementById("j_ml_user_info").innerText += "s";

            Object.keys(mluser.channels).sort((a, b) => { return mluser.channels[a].name - mluser.channels[b].name }).forEach(channel => {
                let channelelemtr = document.createElement("tr");
                let channelelemtd = document.createElement("td");
                channelelemtr.id = `ml_channel_${channel}`;
                channelelemtr.classList.add("j_table_tr");
                channelelemtd.classList.add("j_table_td");
                channelelemtd.innerText = mluser.channels[channel].name;
                channelelemtr.appendChild(channelelemtd);
                document.getElementById("j_table").appendChild(channelelemtr);
            });

            document.getElementById("j_ml_user").style.display = "grid";
        });
    };

    static channel = (channel) => {
        request(apiurl(`/modlookup/channel/${channel}`), (e, r) => {
            if (e) return error(e);

            console.debug("channel", r);
            let mlchannel = r.data;
            document.getElementById("j_ml_channel_channel").innerText = `${mlchannel.name} (${mlchannel.id})`;
            document.getElementById("j_ml_channel_users_number").innerText = Object.keys(mlchannel.users).length;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(mlchannel.users).length > 1) document.getElementById("j_ml_channel_info").innerText += "s";
            Object.keys(mlchannel.users).forEach(user => {
                let channelelemtr = document.createElement("tr");
                let channelelemtd = document.createElement("td");
                channelelemtr.id = `ml_user_${user}`;
                channelelemtr.classList.add("j_table_tr");
                channelelemtd.classList.add("j_table_td");
                channelelemtd.innerText = mlchannel.users[user].name;
                channelelemtr.appendChild(channelelemtd);
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
            document.getElementById("j_vl_user_channels_number").innerText = Object.keys(vluser.channels).length;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(vluser.channels).length > 1) document.getElementById("j_vl_user_info").innerText += "s";
            Object.keys(vluser.channels).forEach(channel => {
                let channelelemtr = document.createElement("tr");
                let channelelemtd = document.createElement("td");
                channelelemtr.id = `vl_channel_${channel}`;
                channelelemtr.classList.add("j_table_tr");
                channelelemtd.classList.add("j_table_td");
                channelelemtd.innerText = vluser.channels[channel].name;
                channelelemtr.appendChild(channelelemtd);
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
            document.getElementById("j_vl_channel_users_number").innerText = Object.keys(vlchannel.users).length;
            [...document.getElementsByClassName("j_table_tr")].forEach(a => a.remove());

            if (Object.keys(vlchannel.users).length > 1) document.getElementById("j_vl_channel_info").innerText += "s";
            Object.keys(vlchannel.users).forEach(user => {
                let channelelemtr = document.createElement("tr");
                let channelelemtd = document.createElement("td");
                channelelemtr.id = `vl_user_${user}`;
                channelelemtr.classList.add("j_table_tr");
                channelelemtd.classList.add("j_table_td");
                channelelemtd.innerText = vlchannel.users[user].name;
                channelelemtr.appendChild(channelelemtd);
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

function validatetoken() {
    if (!document.URL.includes("#access_token=")) return;
    let token = document.URL.split("#access_token=")[1].split("&")[0];
    fetch(`${api_url}/validate`, { headers: { "authorization": token } })
        .then(async req => {
            await req.json();
            console.log(`Successfully authorized`)
            localStorage.setItem("authorization", token);
            window.close();
        })
        .catch(e => {
            error(e);
        });
};

function login() {
    window.open(`https://id.twitch.tv/oauth2/authorize?client_id=1pnta1kpjqm4xth9e60czubvo1j7af&redirect_uri=${url}/validate&scope=&response_type=token`, "_blank");
    new Promise((resolve) => {
        let int = setInterval(waitfortoken, 500);
        function waitfortoken() {
            if (!localStorage.getItem("authorization")) return;
            clearInterval(int);
            resolve();
        };
    })
        .then(() => {
            document.location.reload();
        })
};

function logout() {
    localStorage.removeItem("authorization");
    document.getElementById("j_login").innerText = "Login";
    document.getElementById("j_login").onclick = login;

    document.getElementById("_admin").style.display = "none";
    document.getElementById("_login").style.display = "block";
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

function loadadmin() {
    let isFirst = (admin_interval ?? undefined);

    if (!localStorage.getItem("authorization")) {
        progress(-1);
        document.getElementById("_login").style.display = "block";
        if (admin_interval) clearInterval(admin_interval);
        return;
    };

    fetch(`${api_url}/admin`, { headers: { "authorization": localStorage.getItem("authorization") } })
        .then(async req => {
            let dat_ = await req.json();

            if (dat_.status !== 200) {
                switch (dat_.status) {
                    case 401: {
                        document.getElementById("_noperm").style.display = "block";
                        if (admin_interval) clearInterval(admin_interval);
                        return;
                    };
                    default: {
                        document.getElementById("_admin").style.display = "none";
                        if (admin_interval) clearInterval(admin_interval);
                        return error(dat_);
                    };
                };
            } else {
                document.getElementById("_admin").style.display = "block";
            };

            let dat = dat_.data;

            console.log(dat);

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
                        ["cpu", "usedpercent"],
                        ["memory", "process", "usedpercent"],
                        ["memory", "os", "usedpercent"]
                    ]
                },
                "1": {
                    "names": [
                        "",
                        "Channels",
                        "Users"
                    ],
                    "keypaths": [
                        "Modlookup",
                        ["modlookup", "channels"],
                        ["modlookup", "users"],
                        "\n",
                        "Viplookup",
                        ["viplookup", "channels"],
                        ["viplookup", "users"]
                    ]
                },
                "2": {
                    "names": [
                        "",
                        "Messages/sec",
                        "Messages/min",
                        "Commands/sec",
                        "Commands/min",
                        "Handles",
                        "Handled Commands"
                    ],
                    "keypaths": [
                        "Client",
                        ["handledSecond", "handledClient"],
                        ["handledMinute", "handledClient"],
                        ["handledSecond", "handledClientCommands"],
                        ["handledMinute", "handledClientCommands"],
                        ["handled", "handledClient"],
                        ["handled", "handledClientCommands"],
                        "\n",
                        "Discord Client",
                        ["handledSecond", "handledDiscord"],
                        ["handledMinute", "handledDiscord"],
                        ["handledSecond", "handledDiscordCommands"],
                        ["handledMinute", "handledDiscordCommands"],
                        ["handled", "handledDiscord"],
                        ["handled", "handledDiscordCommands"],
                        "\n",
                        "LogClient",
                        ["handledSecond", "handledLog"],
                        ["handledMinute", "handledLog"],
                        "",
                        "",
                        ["handled", "handledLog"],
                        "",
                    ]
                },
                "3": {
                    "names": [
                        "",
                        "Requests/sec",
                        "Requests/min",
                        "Handles"
                    ],
                    "keypaths": [
                        "Website",
                        ["handledSecond", "handledWebsiteRequests"],
                        ["handledMinute", "handledWebsiteRequests"],
                        ["handled", "handledWebsiteRequests"],
                        "\n",
                        "API",
                        ["handledSecond", "handledAPIRequests"],
                        ["handledMinute", "handledAPIRequests"],
                        ["handled", "handledAPIRequests"]
                    ]
                }
            };

            Object.keys(tables).forEach((a, i) => {
                if (document.getElementById(`_admin_table_${i}`) === null) {
                    let table_elem = document.createElement("table");
                    table_elem.id = `_admin_table_${i}`;
                    table_elem.classList.add("_admin_table");

                    let th_tr_elem = document.createElement("tr");
                    let tr_elem = document.createElement("tr");
                    tr_elem.id = `_admin_table_${i}_tr_0`;
                    tr_elem.classList.add(`_admin_table_${i}_tr`);

                    tables[a].names.forEach((b, i2) => {
                        let th_elem = document.createElement("th");
                        th_elem.innerText = (b ?? "");
                        if ((b?.toString()?.length ?? 0) === 0) th_elem.classList.add("noborder");
                        th_elem.classList.add("_admin_table_th");

                        th_tr_elem.appendChild(th_elem);
                    });

                    table_elem.appendChild(th_tr_elem);
                    table_elem.appendChild(tr_elem);

                    document.getElementById("_admin").appendChild(table_elem);
                };

                let tabletr = document.getElementById(`_admin_table_${i}_tr_0`);

                tables[a].keypaths.forEach((b, i2) => {
                    let val = (!Array.isArray(b) ? b : getKeyFromObject(dat, b));

                    if (Array.isArray(val)) {
                        val = val.length;
                    } else if (["string", "number"].includes(typeof val) && val.toString().includes(".")) {
                        val = val.toString();
                        val = val.slice(0, (val.split(".")[0].length + 1 + 2)) + "%";
                    };

                    let key_elem_id = `_admin_table_${i}_${i2}`;

                    if (document.getElementById(key_elem_id) !== null) {
                        document.getElementById(key_elem_id).innerText = val;
                        return;
                    };

                    if (val === "\n") {
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
                            let key_elem = document.createElement("td");
                            key_elem.classList.add("_admin_table_td");
                            key_elem.id = key_elem_id;
                            key_elem.innerText = val;
                            if ((val?.toString()?.length ?? 0) === 0) key_elem.classList.add("noborder");
                            key_elem.classList.add(`_admin_table_${i}_td`);

                            tabletr.appendChild(key_elem);
                        } else {
                            document.getElementById(`_admin_table_${i}_${i2}`).innerText = val;
                        };
                    }
                });
            });

            if (isFirst) progress(100);
        })
        .catch(e => {
            error(e);
            document.getElementById("_admin").style.display = "none";
            if (admin_interval) clearInterval(admin_interval);
            return;
        });
};

if (document.getElementById("j_login")) {
    if (localStorage.getItem("authorization")) {
        document.getElementById("j_login").innerText = "Logout";
        document.getElementById("j_login").onclick = logout;
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

        case "/validate": {
            validatetoken(); break;
        };

        case "/admin": {
            loadadmin();
            admin_interval = setInterval(loadadmin, 1000);
            break;
        };

        default: {
            progress(-1);
        };
    };
};

autoexec();

window.addEventListener("keypress", ev => {
    switch (ev.key) {
        case "Enter": {
            autoexec(); break;
        };
    };
});