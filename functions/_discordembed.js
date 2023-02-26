const { Embed } = require("discord.js");
const c = require("../config.json");

module.exports = class _discordembed {
    constructor(title, description, url, timestamp, color, fields, author, thumbnail, image, video, footer) {
        let data = {};
        this.title = data.title = title ?? "";
        this.description = data.description = description ?? "<Empty>";
        this.timestamp = data.timestamp = timestamp ?? new Date();
        this.color = data.color = color ?? c.default.color;
        this.fields = data.fields = fields ?? [];
        this.author = data.author = author ?? {};
        this.thumbnail = data.thumbnail = thumbnail ?? {};
        this.image = data.image = image ?? {};
        this.video = data.video = video ?? {};
        this.footer = data.footer = footer ?? {};

        if ((url ?? undefined)) this.url = data.url = url;

        if (!(title ?? undefined) && this.description && this.description?.startsWith("error")) {
            this.image = data.image = (image ?? { url: c.default.discord.images.error + "?size=300" });
            this.color = data.color = "#FF0000";
            this.title = data.title = title = description.split("\n")[0];
            this.description = data.description = description.substring(description.split("\n")[0].length + 1);
        };

        return new Embed(data);
    };
};