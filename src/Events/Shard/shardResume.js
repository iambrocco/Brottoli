const { Events } = require("discord.js");
const Client = require("../../Structures/Client.js");
module.exports = {
  name: Events.ShardResume,
  /**
   *
   * @param {Client} client
    * @param {Object} shardId
 * @param {Object} replayedEvents
   */
  async execute(client, shardId, replayedEvents) {
    client.log(shardId, replayedEvents)
  },
};
        