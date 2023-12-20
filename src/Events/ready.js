const { ActivityType } = require("discord.js");
const Client = require("../Structures/Client");

module.exports = {
  name: "ready",
  /**
   *
   * @param {Client} client
   */
  async execute(client) {

    console.log(`${client.user.tag} is ready!`)
      client.user.setPresence({
        activities: [{ name: `/help`, type: ActivityType.Playing }],
      });
  },
};
