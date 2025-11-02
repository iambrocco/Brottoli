const { Events } = require("discord.js");
const Client = require("../../Structures/Client.js");
module.exports = {
  name: Events.ShardError,
  /**
   *
   * @param {Client} client
    * @param {Object} error
 * @param {Object} shardId
   */
  async execute(client, error, shardId) {
    client.log(error, shardId)
  },
};
        