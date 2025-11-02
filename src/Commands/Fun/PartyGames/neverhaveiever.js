const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes.js");
const { neverHaveIEver } = require("party-game-sentences");

module.exports = {
  data: new CommandBuilder()
    .setName("nhie")
    .setDescription("Play Never Have I Ever")
    .setCategory("Fun")
    .setType(CommandTypes.SLASH),

  async execute(interaction) {
    const sentence = neverHaveIEver();

    const embed = new EmbedBuilder()
      .setTitle("🎲 Never Have I Ever")
      .setDescription(sentence)
      .setColor("Random");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("neverhaveiever_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    // Save session
    if (!interaction.client.partySessions) interaction.client.partySessions = new Map();
    interaction.client.partySessions.set(message.id, { type: "neverhaveiever" });
  },
};
