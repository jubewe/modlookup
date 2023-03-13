function _apiurl(u) { return `https://modlookup-api.jubewe.de` + (!u.startsWith("/") ? "/" : "") + (u) };
module.exports = _apiurl;