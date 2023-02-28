const j = require("../variables/j");

/** @param {number} time */
function getHandles(time) {
    let r = {};

    Object.keys(j.handledCache).forEach((cacheName) => {
        // console.log(cacheName, Object.keys(j.handledCache[cacheName]), Object.keys(j.handledCache[cacheName]).filter(a => a.startsWith("/")))
        if (Object.keys(j.handledCache[cacheName]).filter(a => a.startsWith("/")).length > 0) {
            r[cacheName] = {};
            Object.keys(j.handledCache[cacheName]).forEach(cacheName2 => {
                let cacheKeys = Object.keys(j.handledCache[cacheName][cacheName2]);
                let cacheKeysFiltered = Object.keys(j.handledCache[cacheName][cacheName2]).filter(a => parseInt(a) >= (Date.now() - time - parseInt(Date.now().toString().split("").reverse().slice(0, 3).reverse().join("")) - 500));
    
                r[cacheName][cacheName2] = (
                    j.handledCache[cacheName][cacheName2][cacheKeys[cacheKeys.length - 1]] -
                    (time <= 0 ? 0 : j.handledCache[cacheName][cacheName2][cacheKeysFiltered[0]])
                );
            });
        } else {
            let cacheKeys = Object.keys(j.handledCache[cacheName]);
            let cacheKeysFiltered = Object.keys(j.handledCache[cacheName]).filter(a => parseInt(a) >= (Date.now() - time - parseInt(Date.now().toString().split("").reverse().slice(0, 3).reverse().join("")) - 500));

            r[cacheName] = (
                j.handledCache[cacheName][cacheKeys[cacheKeys.length - 1]] -
                (time <= 0 ? 0 : j.handledCache[cacheName][cacheKeysFiltered[0]])
            );
        };
    });

    return r;
};

module.exports = getHandles;