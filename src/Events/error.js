const { Events } = require("discord.js");

module.exports = {
  name: Events.Error,
  /**
   *
   * @param {import("discord.js").DiscordjsError} error
   */
  async execute(client, error) {
    client.log(error, "error");
  },
};
