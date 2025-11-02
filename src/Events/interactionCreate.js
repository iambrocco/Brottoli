const { Events } = require("discord.js");
const ErrorEmbed = require("../Structures/ErrorEmbed.js");
module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    /**
     * @type {import("mysql2").Connection}
     */
    const db = client.db;
    if (db.authorized) {
      db.query(
        `SELECT * FROM \`guilds\` WHERE guildId = ?`,
        [interaction.guildId],
        (err, result) => {
          if (err) {
            client.log(err, "error");
            return;
          }
          if (!result[0] || result.length == 0) {
            db.query(
              "INSERT INTO `guilds`(`guildId`, `join_channel`, leave_channel, `customConfig`) VALUES (?, ?, ?, ?)",
              [interaction.guildId, 0, 0, 0]
            );
          }
        }
      );
    }
    if (interaction.isCommand()) {
      let command = interaction.client.Commands.get(interaction.commandName);
      if (command.data.commandType.toLowerCase() == "text") {
        let errorEmbed = new ErrorEmbed().setError({
          name: "Wrong Command Type!",
          value: "This Command is a text only command!",
        });
        await interaction.reply({ embeds: [errorEmbed] });
      } else {
        command.execute(interaction).catch((err) => {
          client.log(err, "error");
        });
      }
    }
  },
};
