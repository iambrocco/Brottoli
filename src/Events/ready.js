const { ActivityType } = require("discord.js");
const Client = require("../Structures/Client");

module.exports = {
  name: "ready",
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    client.log(`${client.user.tag} is ready!`)
    client.user.setPresence({
      activities: [{ name: `/help`, type: ActivityType.Playing }],
    });
    process.on('uncaughtException', (err) => {
      client.log('Uncaught Exception: ' + err, "error");

    });

    process.on('unhandledRejection', (reason, promise) => {
      client.log('Unhandled Rejection: ' + reason, "error");

    });
  },
};
