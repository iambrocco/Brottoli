const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
module.exports = {
  data: new CommandBuilder()
    .setName("eval")
    .setDescription("JS Code Emulator")
    .setType(CommandTypes.SLASH)
    .setCategory("Miscellaneous"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("evalModal")
      .setTitle("Run JS Code");
    // Create the text input components
    const codeInput = new TextInputBuilder()
      .setCustomId("codeInput")
      .setPlaceholder("VANILLA JAVASCRIPT ONLY")
      .setRequired(true)
      // The label is the prompt the user sees for this input
      .setLabel("Insert JS Code")
      // Short means only a single line of text
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1024);

    const ActionRow = new ActionRowBuilder().addComponents(codeInput);
    // Add inputs to the modal
    modal.addComponents(ActionRow);
    // Show the modal to the user
    await interaction.showModal(modal);
  },
};
