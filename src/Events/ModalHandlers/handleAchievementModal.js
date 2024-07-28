const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      interaction.isModalSubmit() &&
      interaction.customId == "achievementModal"
    ) {
        const Icons = require("../../Data/minecraft.json").Icons;
        const yellowText =
          interaction.fields.getTextInputValue("yellowTextInput");
        const whiteText =
          interaction.fields.getTextInputValue("whiteTextInput");
        const iconText = interaction.fields.getTextInputValue("iconInput");
        for (const icon in Icons) {
          const element = Icons[icon];
          if (!iconText || iconText.toLowerCase() != element.toLowerCase()) {
            var image = `https://minecraftpanda.com/tools/achievement-generator/output?icon=1&title=${encodeURI(
              yellowText
            )}&text=${encodeURI(whiteText)}`;
          }
          if (iconText.toLowerCase() == element.toLowerCase()) {
            var image = `https://minecraftpanda.com/tools/achievement-generator/output?icon=${
              parseInt(icon) + 1
            }&title=${encodeURI(yellowText)}&text=${encodeURI(whiteText)}`;
            break;
          }
        }

        await interaction.reply({embeds: [new EmbedBuilder().setImage(image)]});
    }
  },
};
