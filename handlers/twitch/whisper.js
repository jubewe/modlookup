const getuserperm = require("../../functions/getuserperm");
const dm_commandhandler = require("./dm_commandhandler");

module.exports = async (response) => {
    let permission = response.permission = await getuserperm(response.senderUserID);

    if (response.command) return dm_commandhandler(response);
};