const Client = require("../../Structures/Client.js");
module.exports = {
  name: "shardError",
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
        