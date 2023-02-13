const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId == "achievementModal") {
        const Icons = require("../Data/icons.json").Icons;
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

        await interaction.reply({embeds: [new MessageEmbed().setImage(image)]});
      }
    }
  },
};
