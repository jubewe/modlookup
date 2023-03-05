const request = require("request");
const files = require("../variables/files");
const _returnerr = require("../functions/_returnerr");

async function validatetoken(token) {
    return new Promise((resolve, reject) => {
        if (!token) return reject({ error: Error("token is undefined") });

        request(`https://id.twitch.tv/oauth2/validate`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }, (e, r) => {
            if (e || (r.statusCode !== 200)) return reject({ error: (e ?? Error(r.body)) });

            let dat = JSON.parse(r.body);

            files.express_auth.tokens[token] = dat;
            files.express_auth.ids[dat.user_id] = token;

            dat = {
                ...dat,
                token: token
            };

            return resolve(dat);
        });
    });
};

module.exports = validatetoken;