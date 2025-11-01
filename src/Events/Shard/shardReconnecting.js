const Client = require("../../Structures/Client.js");
module.exports = {
  name: "shardReconnecting",
  /**
   *
   * @param {Client} client
    * @param {Object} shardId
   */
  async execute(client, shardId) {
    client.log(shardId)
  },
};
        