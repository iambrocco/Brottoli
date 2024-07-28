// Import
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  Colors,
  EmbedBuilder,
} = require("discord.js");
const mcData = require("../../Data/minecraft.json");
const Icons = mcData.Icons;
// Creating the command
module.exports = {
  // Exporting the Data
  data: new CommandBuilder()
    .setCategory("Minecraft")
    .setType(CommandTypes.SLASH)

    .setName("achievement")
    .setDescription("Generates A Minecraft Achievement Image")
    .addSubcommand((sub) =>
      sub
        .setName("icons")
        .setDescription("Sends a list of the icons for /achievement available")
    )
    .addSubcommand((sub) =>
      sub
        .setName("generate")
        .setDescription("Generates A Minecraft Achievement Image")
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Array} args
   */
  async execute(interaction, args) {
    if (interaction.options.getSubcommand() == "generate") {
      const modal = new ModalBuilder()
        .setCustomId("achievementModal")
        .setTitle("Minecraft Achievement Generator");
      // Add components to modal
      // Create the text input components
      const yellowTextInput = new TextInputBuilder()
        .setCustomId("yellowTextInput")
        .setPlaceholder("Achievement Get!")
        .setRequired(true)
        // The label is the prompt the user sees for this input
        .setLabel("Input The Text in yellow")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);
      const whiteTextInput = new TextInputBuilder()
        .setCustomId("whiteTextInput")
        .setPlaceholder("DIAMONDS!")
        .setRequired(true)
        .setLabel("Input The Text in white")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);
      const iconInput = new TextInputBuilder()
        .setCustomId("iconInput")
        .setLabel("What Icon Do You Want?")
        .setPlaceholder("/achievement icons for list of possible icons")
        .setStyle(TextInputStyle.Short);
      // An action row only holds one text input,
      // so you need one action row per text input.
      const firstActionRow = new ActionRowBuilder().addComponents(
        yellowTextInput
      );
      const secondActionRow = new ActionRowBuilder().addComponents(
        whiteTextInput
      );
      const thirdActionRow = new ActionRowBuilder().addComponents(iconInput);
      // Add inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
      // Show the modal to the user

      await interaction.showModal(modal);
    }
    if (interaction.options.getSubcommand() === "icons") {
      let currentEmbed = 1;
      var firstIconsEmbed = new EmbedBuilder()
        .setTitle("Achievement Command Icon List 1/3")
        .setColor(Colors.DarkButNotBlack);
      var secondIconsEmbed = new EmbedBuilder()
        .setTitle("Achievement Command Icon List 2/3")
        .setColor(Colors.DarkButNotBlack);
      var thirdIconsEmbed = new EmbedBuilder()
        .setTitle("Achievement Command Icon List 3/3")
        .setColor(Colors.DarkButNotBlack);

      Icons.forEach((icon, i) => {
        if (i <= 12) {
          firstIconsEmbed.addFields({
            name: `Icon ${i + 1}`,
            value: `${icon}`,
            inline: true,
          });
        }
        if (i <= 25 && i > 12) {
          secondIconsEmbed.addFields({
            name: `Icon ${i + 1}`,
            value: `${icon}`,
            inline: true,
          });
        }
        if (i <= 38 && i > 12 && i > 25) {
          thirdIconsEmbed.addFields({
            name: `Icon ${i + 1}`,
            value: `${icon}`,
            inline: true,
          });
        }
      });
      await interaction.reply({
        embeds: [firstIconsEmbed, secondIconsEmbed, thirdIconsEmbed],
        ephemeral: true,
      });
    }
  },
};
