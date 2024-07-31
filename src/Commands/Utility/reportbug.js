const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
  } = require("discord.js");
  const CommandBuilder = require("../../Structures/CommandBuilder.js");
  const CommandTypes = require("../../Structures/Enums/CommandTypes.js");;
  
  module.exports = {
    data: new CommandBuilder()
      .setName("reportbug")
      .setDescription(`Report a Bug of Brottoli`)
      .setCategory("Utility")
      .setType(CommandTypes.SLASH),
    /**
     *
     * @param {import("discord.js").Interaction} interaction
     */
    async execute(interaction) {
      let reportBugModal = new ModalBuilder();
      let titleTextInput = new TextInputBuilder();
      let bodyTextInput = new TextInputBuilder();
      titleTextInput
        .setStyle(TextInputStyle.Short)
        .setCustomId("title")
        .setRequired(true)
        .setLabel("Bug Title")
        .setPlaceholder("Enter a Title for your bug (ie: brief description)")
        .setMaxLength(26);
      bodyTextInput
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("body")
        .setLabel("The Bug, In detail")
        .setPlaceholder("Talk About the bug and mention steps to reproduce")
        .setMaxLength(2000)
        .setRequired(true);
      let titleTextRow = new ActionRowBuilder().addComponents(titleTextInput);
      let bodyTextRow = new ActionRowBuilder().addComponents(bodyTextInput);
      reportBugModal
        .setCustomId("reportBugModal")
        .setTitle("Report a Bug...")
        .addComponents(titleTextRow, bodyTextRow);
      interaction.showModal(reportBugModal);
    },
  };
  