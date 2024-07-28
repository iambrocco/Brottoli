const { EmbedBuilder, Colors } = require("discord.js");
const ErrorEmbed = require("../Structures/ErrorEmbed.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    const db = client.db;
    db.query(
      `SELECT * FROM \`guilds\` WHERE guildId = ?`,
      [interaction.guildId],
      (err, result, fields) => {
        if (!result[0] || result.length == 0) {
          db.query(
            "INSERT INTO `guilds`(`guildId`, `joinLeaveEnabled`, `customConfig`) VALUES (?, ?, ?)",
            [interaction.guildId, 0, 0]
          );
        }
      }
    );
    if (interaction.isCommand()) {
      let command = interaction.client.Commands.get(interaction.commandName);
      if (command.data.commandType.toLowerCase() == "text") {
        let errorEmbed = new ErrorEmbed().setError({
          name: "Wrong Command Type!",
          value: "This Command is a text only command!",
        });
        await interaction.reply({ embeds: [errorEmbed] });
      } else {
        await command.execute(interaction);
      }
    }
  },
};
