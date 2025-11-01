module.exports = {
  name: "error",
  /**
   *
   * @param {import("discord.js").DiscordjsError} error
   */
  async execute(client, error) {
    client.log(error, "error");
  },
};
