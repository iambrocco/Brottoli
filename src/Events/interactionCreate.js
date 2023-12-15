const { EmbedBuilder, Colors } = require("discord.js");
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isCommand()) {
      let command = interaction.client.Commands.get(interaction.commandName);
      if (command.data.commandType.toLowerCase() == "text") {
        let errorEmbed = new EmbedBuilder()
          .setTitle("Error!")
          .setColor(Colors.Red)
          .addFields({
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
