const { regex } = require("oberknecht-client/lib");
const _log = require("../../functions/_log");
const _stackname = require("../../functions/_stackname");
const files = require("../../variables/files");
const j = require("../../variables/j");

function convertToBuffer(stuff) {
    return Buffer.from((regex.jsonreg().test(stuff) ? JSON.stringify(stuff) : stuff));
};

module.exports = () => {
    j.ws.server.on("listening", () => {
        _log(1, `${_stackname("ws", "server")[3]} Listening`);
    });

    j.ws.server.on("close", (e) => {
        _log(2, e);
    });

    j.ws.server.on("connection", (ws) => {
        console.log("ws connection");

        ws.sendWC = (stuff, status) => {
            if ((status ?? undefined) || stuff.error) return ws.send(JSON.stringify({ "status": status ?? 400, "error": (stuff.error.message ?? stuff.error ?? stuff) }));
            return ws.send(JSON.stringify({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff) }));
        };

        let ws_data = {
            permission: {
                "num": 10
            }
        };

        ws.on("message", (response_) => {
            if (!regex.jsonreg().test(response_)) return ws.sendWC({ error: Error("message is not in json format") });

            let response = JSON.parse(response_);

            console.log("ws message", response);

            if (!response.command) return ws.sendWC({ error: Error("message.command is undefined") });

            let sendWC = (stuff, status, command) => {
                if ((status ?? undefined) || stuff.error) return ws.send(JSON.stringify({ "status": status ?? 400, "error": (stuff.error.message ?? stuff.error ?? stuff), command: (command ?? response.command) }));
                return ws.send(JSON.stringify({ status: 200, "data": (["number", "object"].includes(typeof stuff) ? stuff : stuff), command: (command ?? response.command) }));
            };

            switch (response.command) {
                case "login": {
                    if (!response.authorization) return sendWC({ error: Error("message.authorization is undefined") });

                    let token = response.authorization.replace(/^Bearer\s/, "").toLowerCase();

                    if (!files.express_auth.tokens[token]) return sendWC({ error: Error("provided token not in saved tokens, validate on the website at /validate first") });

                    let perm = files.express_auth.tokens[token];

                    if (files.permissions.users[perm.user_id]) {
                        ws_data.permission = {
                            "num": parseInt(files.permissions.users[perm.user_id] ?? 10),
                            "id": perm.user_id,
                            "token": token,
                            "_raw": perm
                        };
                    };

                    sendWC("Successfully logged in");

                    break;
                };

                case "test": {
                    sendWC("test");

                    break;
                };

                case "ping": {
                    sendWC("pong");

                    break;
                };

                case "pong": {
                    ws_data.pings_pending = 0;
                    ws_data.last_pong = Date.now();

                    break;
                };
            };
        });

        function heartbeat() {
            if (ws_data.pings_pending && ws_data.pings_pending >= j.config.ws.pings_before_close) return ws.close(418, convertToBuffer({ error: Error(`client did not send pong after ${j.config.ws.pings_before_close} tries`) }));

            ws.sendWC("ping");
            ws_data.last_ping = Date.now();
            if (!ws_data.pings_pending) ws_data.pings_pending = 0;
            ws_data.pings_pending++;
        };

        ws_data.heartbeat_interval = setInterval(heartbeat, j.config.ws.heartbeat_interval);

        ws.on("close", () => {
            console.log("ws closed");

            if (ws_data.heartbeat_interval) clearInterval(ws_data.heartbeat_interval);
        });
    });
};