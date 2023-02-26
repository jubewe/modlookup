const { Message } = require("discord.js");
const privmsgMessage = require("oberknecht-client/lib/parser/PRIVMSG.Message");
const whisperMessage = require("oberknecht-client/lib/parser/WHISPER.Message");
const _discordembed = require("../functions/_discordembed");

module.exports = class j_ {
    /** @param {privmsgMessage | Message | whisperMessage} response */
    constructor(response) {
        // super();
        Object.keys(response).forEach(a => {
            this[a] = response[a];
        });

        this.reply = async (message) => {
            switch (typeof response) {
                case privmsgMessage:
                case whisperMessage: {
                    return response.reply;
                };

                case Message: {
                    switch (typeof message) {
                        case "string": {
                            return response.reply({ embeds: new _discordembed(undefined, message) });
                        };

                        case "object": {
                            return response.reply(message);
                        };
                    };
                };
            };
        };

        this.permission = {
            "num": Number(),
            "desc": String() || undefined,
            "name": String() || undefined
        }
    };
};