const { ActivityType } = require("discord.js");
const Client = require("../Structures/Client");

module.exports = {
  name: "ready",
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    console.log(`${client.user.tag} is ready!`);
    let customStatusChannelId = "1177592660278640701";
    setInterval(async () => {
      let lastMessageId = client.channels.cache.get(
        customStatusChannelId
      ).lastMessageId;
      let customStatus = (
        await client.channels.cache
          .get(customStatusChannelId)
          .messages.fetch(lastMessageId)
      ).content;
      client.user.setPresence({
        activities: [{ name: `${customStatus}`, type: ActivityType.Custom }],
      });
    }, 5000);
  },
};
