const { EmbedBuilder, Colors, Events, MessageFlags } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {import("discord.js").StringSelectMenuInteraction} interaction
   */
  async execute(client, interaction) {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId == "helpSelectMenu"
    ) {
      const helpEmbed = new EmbedBuilder()
        .setTitle(
          `${interaction.client.user.username}'s List of ${interaction.values[0]} Commands`
        )
        .setColor(Colors.Green);

      // Get the first entry from CommandCategories
      const commands = interaction.client.CommandCategories.get(
        interaction.values[0]
      );

      if (commands) {
        const sortedCommands = [...commands].sort((a, b) =>
          a.data.name.localeCompare(b.data.name)
        );
        let values = [];
        sortedCommands.map(
          (cmd, index) =>
            (values[index] = {
              name: `${cmd.data.name.replace(
                cmd.data.name.charAt(0),
                cmd.data.name.charAt(0).toUpperCase()
              )}`,
              value: `${cmd.data.description}`,
            })
        );

        helpEmbed.addFields(...values);
      }
      interaction.message.edit({
        embeds: [helpEmbed],
      });
      interaction
        .reply({
          flags: MessageFlags.Ephemeral,
          content: "** **",
        })
        .then((message) => {
          message.delete();
        });
    }
  },
};
