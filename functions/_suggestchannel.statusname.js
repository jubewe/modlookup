/** @param {number} num */
function suggestchannelStatusname(num){
    switch (num) {
        case 0: return "Pending";
        case 1: return "Approved";
        case 2: return "Denied";
    };
};

module.exports = suggestchannelStatusname;