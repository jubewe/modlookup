const osUtils = require("os-utils");

(async () => {
    console.log(await new Promise((resolve) => {osUtils.cpuUsage(resolve)}))
})();