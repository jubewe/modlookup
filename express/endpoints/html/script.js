const url = new URL(document.baseURI).origin;
const api_url = (url.split(".")[0].split("-dest")[0] + "-api" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));
function apiurl(u) { return api_url + (!u.startsWith("/") ? "/" : "") + (u) };
function siteurl(u) { return url + (!u.startsWith("/") ? "/" : "") + (u) };
function redirect(url) { document.location.replace(url); };

function progress(num) {
    const progress_elem = document.getElementById("j_progress");

    const num_ = (num > 0 && num < 1 ? num * 100 : num);

    if (num_ < 100) progress_elem.classList.replace("progress_load_end", "progress_load");
    if (num_ === 100) progress_elem.classList.replace("progress_load", "progress_load_end");

    progress_elem.style.display = (num >= 0 ? "grid" : "none");
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
    let request = new XMLHttpRequest();
    request.open("GET", `https://id.twitch.tv/oauth2/validate`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.addEventListener("load", async (r) => {
        let dat = JSON.parse(request.response);
        if (dat.status !== undefined) {
            dat = {
                ...dat,
                token: token
            };
            window.localStorage.setItem("j_token", JSON.stringify());
            window.close();
        } 
    })
};

const currentendpoint = document.URL.replace(/http(s)*:\/\/(mod|vip)lookup(-dest)*\.jubewe\.de/g, "");
const currentendpointparts = currentendpoint.split("/").slice(1);
progress(0);
let autoexecs = 0;
function autoexec() {
    console.debug("autoexec");
    autoexecs++;
    switch (currentendpoint.split("/").slice(0, 3).join("/")) {
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
            if (currentinput) ml.channel(currentinput); break;
        };

        case "/modlookup/user": {
            let currentinput = (document.getElementById('ml_user_input')?.value?.length > 0 ? document.getElementById('ml_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('ml_user_input')?.value?.length > 0) redirect(siteurl('/modlookup/user/' + document.getElementById('ml_user_input').value))
            if (currentinput) ml.user(currentinput); break;
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
            if (currentinput) vl.channel(currentinput); break;
        };

        case "/viplookup/user": {
            let currentinput = (document.getElementById('vl_user_input')?.value?.length > 0 ? document.getElementById('vl_user_input').value : currentendpointparts[2]);
            if (autoexecs > 1 && document.getElementById('vl_user_input')?.value?.length > 0) redirect(siteurl('/viplookup/user/' + document.getElementById('vl_user_input').value))
            if (currentinput) vl.user(currentinput); break;
        };

        case "/validate": {
            validatetoken(); break;
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