const Client = require("../../Structures/Client.js");
module.exports = {
  name: "shardDisconnect",
  /**
   *
   * @param {Client} client
    * @param {Object} closeEvent
 * @param {Object} shardId
   */
  async execute(client, closeEvent, shardId) {
    setInterval(() => {
      client.shard.respawnAll()
    }, 5000);
    client.log(closeEvent, shardId)
  },
};
        