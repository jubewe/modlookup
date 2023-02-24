const url = new URL(document.baseURI).origin;
const api_url = (url.split(".")[0].split("-dest")[0] + "-api" + (url.split(".")[0].includes("dest") ? "-dest" : "") + "." + url.split(".").slice(1).join("."));

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
        request(`${api_url}/modlookup/users`, (e, r) => {
            if (e) return error(e);

            document.getElementById("j_ml_users").style.display = "grid";
            document.getElementById("j_ml_users_number").innerText = r.data;
        })
    };

    static channels = () => {
        request(`${api_url}/modlookup/channels`, (e, r) => {
            if (e) return error(e);

            document.getElementById("j_ml_channels").style.display = "grid";
            document.getElementById("j_ml_channels_number").innerText = r.data;
        });
    };

    static user = (user) => {
        request(`${api_url}/modlookup/user/${user}`, (e, r) => {
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
        request(`${api_url}/modlookup/channel/${channel}`, (e, r) => {
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
        request(`${api_url}/modlookup`, (e, r) => {
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
        request(`${api_url}/viplookup/users`, (e, r) => {
            if (e) return error(e);

            document.getElementById("j_vl_users").style.display = "grid";
            document.getElementById("j_vl_users_number").innerText = r.data;
        })
    };

    static channels = () => {
        request(`${api_url}/viplookup/channels`, (e, r) => {
            if (e) return error(e);

            document.getElementById("j_vl_channels").style.display = "grid";
            document.getElementById("j_vl_channels_number").innerText = r.data;
        });
    };

    static user = (user) => {
        request(`${api_url}/viplookup/user/${user}`, (e, r) => {
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
        request(`${api_url}/viplookup/channel/${channel}`, (e, r) => {
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
        request(`${api_url}/viplookup`, (e, r) => {
            if (e) return error(e);

            let vldata = r.data;
            document.getElementById("j_vl_channels_number").innerText = vldata.channels;
            document.getElementById("j_vl_users_number").innerText = vldata.users;
            document.getElementById("j_vl").style.display = "grid";
        });
    };
};


const currentendpoint = document.URL.replace(/http(s)*:\/\/(mod|vip)lookup(-dest)*\.jubewe\.de/g, "");
const currentendpointparts = currentendpoint.split("/").slice(1);
progress(0);
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

    case "/modlookup/user": {
        if (currentendpointparts[2]) ml.user(currentendpointparts[2]); break;
    };

    case "/modlookup/channel": {
        if (currentendpointparts[2]) ml.channel(currentendpointparts[2]); break;
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

    case "/viplookup/user": {
        if (currentendpointparts[2]) vl.user(currentendpointparts[2]); break;
    };

    case "/viplookup/channel": {
        if (currentendpointparts[2]) vl.channel(currentendpointparts[2]); break;
    };
};