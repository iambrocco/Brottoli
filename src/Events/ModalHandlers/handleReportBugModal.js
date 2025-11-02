const { EmbedBuilder, Colors, Events } = require("discord.js");
require("dotenv").config();
module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      interaction.isModalSubmit() &&
      interaction.customId == "reportBugModal"
    ) {
      let bugEmbed = new EmbedBuilder();
      bugEmbed
        .setColor(Colors.Green)
        .setTitle(
          `${interaction.fields.getTextInputValue("title")} - by ${
            interaction.user.tag
          }`
        )
        .addFields({
          name: `Bug Detail`,
          value: `${interaction.fields.getTextInputValue("body")}`,
        });
      let submittedEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Your Bug Was Successfully Reported!")
        .addFields({
          name: "Your bug was reported",
          value: `It will be fixed soon..`,
        });
      interaction.client.channels.cache
        .get(process.env.bugs_channelId)
        .send({ embeds: [bugEmbed] });
      interaction.reply({ embeds: [submittedEmbed] });
    }
  },
};
