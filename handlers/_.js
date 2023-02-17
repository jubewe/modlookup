module.exports = () => {
    require("./filechange")();

    setInterval(require("./filechange"), 10000);
};