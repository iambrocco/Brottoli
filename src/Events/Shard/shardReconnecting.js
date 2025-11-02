const { Events } = require("discord.js");
const Client = require("../../Structures/Client.js");
module.exports = {
  name: Events.ShardReconnecting,
  /**
   *
   * @param {Client} client
    * @param {Object} shardId
   */
  async execute(client, shardId) {
    client.log(shardId)
  },
};
        