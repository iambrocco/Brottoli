const { Events } = require("discord.js");
const Client = require("../../Structures/Client.js");
module.exports = {
  name: Events.ShardReady,
  /**
   *
   * @param {Client} client
    * @param {Object} shardId
 * @param {Object} unavailableGuilds
   */
  async execute(client, shardId, unavailableGuilds) {
    client.log(`${shardId} ${unavailableGuilds}`, "debug")
  },
};
        