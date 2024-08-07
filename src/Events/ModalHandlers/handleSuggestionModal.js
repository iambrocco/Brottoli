const { EmbedBuilder, Colors } = require("discord.js");
require("dotenv").config();
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      interaction.isModalSubmit() &&
      interaction.customId == "suggestionModal"
    ) {
      let suggestionEmbed = new EmbedBuilder();
      suggestionEmbed
        .setColor(Colors.Green)
        .setTitle(
          `${interaction.fields.getTextInputValue("title")} - by ${
            interaction.user.tag
          }`
        )
        .addFields({
          name: `Suggestion Body`,
          value: `${interaction.fields.getTextInputValue("body")}`,
        });
      let submittedEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Your Suggestion Was Successfully Sent!")
        .addFields({
          name: "Your suggestion was sent",
          value: `It will be reviewed soon..`,
        });
      interaction.client.channels.cache
        .get(process.env.suggestions_channelId)
        .send({ embeds: [suggestionEmbed] });
      interaction.reply({ embeds: [submittedEmbed] });
    }
  },
};
