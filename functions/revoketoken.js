const request = require("request");
const files = require("../variables/files");

async function revoketoken(token, clientid, user_id) {
    return new Promise((resolve, reject) => {
        if (!(token ?? undefined) || !(clientid ?? undefined)) return reject({ error: Error("token or clientid is undefined") });
        request(`https://id.twitch.tv/oauth2/revoke`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body: `client_id=${clientid}&token=${token}`
        }, (e, r) => {
            if (e || (r.statusCode !== 200)) return reject({ error: (e ?? Error(r.body)) });

            if (files.express_auth.tokens[token]) delete files.express_auth.tokens[token];
            if (user_id && files.express_auth.ids[user_id]) delete files.express_auth.ids[user_id];

            return resolve();
        });
    });
};

module.exports = revoketoken;