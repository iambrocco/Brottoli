const { Message, EmbedBuilder, Colors } = require("discord.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   */
  async execute(client, message) {
    const db = client.db;
    db.query(`SELECT * FROM \`guilds\` WHERE guildId = ?`, [message.guildId], (err, result, fields) => {
      if(!result[0] || result.length == 0) {
        
      }
    })
  }
}