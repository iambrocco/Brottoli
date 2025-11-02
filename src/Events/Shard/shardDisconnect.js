const { Events } = require("discord.js");
const Client = require("../../Structures/Client.js");
module.exports = {
  name: Events.ShardDisconnect,
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
        