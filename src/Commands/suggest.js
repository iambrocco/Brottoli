const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder");

module.exports = {
  data: new CommandBuilder()
    .setName("suggest")
    .setDescription(`Suggest a Feature for Brottoli`)
    .setCategory("Utility")
    .setType("SLASH"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    let suggestionModal = new ModalBuilder();
    let titleTextInput = new TextInputBuilder();
    let bodyTextInput = new TextInputBuilder();
    titleTextInput
      .setStyle(TextInputStyle.Short)
      .setCustomId("title")
      .setRequired(true)
      .setLabel("Suggestion Title")
      .setPlaceholder("Enter a Title for your suggestion")
      .setMaxLength(26);
    bodyTextInput
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("body")
      .setLabel("Your Suggestion, In detail")
      .setPlaceholder("Talk About Your Suggestion")
      .setMaxLength(2000)
      .setRequired(true);
    let titleTextRow = new ActionRowBuilder().addComponents(titleTextInput);
    let bodyTextRow = new ActionRowBuilder().addComponents(bodyTextInput);
    suggestionModal
      .setCustomId("suggestionModal")
      .setTitle("Suggest a Feature...")
      .addComponents(titleTextRow, bodyTextRow);
    interaction.showModal(suggestionModal);
  },
};
