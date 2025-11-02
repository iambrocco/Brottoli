const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes.js");
const { wouldYouRather } = require("party-game-sentences");

module.exports = {
  data: new CommandBuilder()
    .setName("wyr")
    .setDescription("Play Would You Rather")
    .setCategory("Fun")
    .setType(CommandTypes.SLASH),

  async execute(interaction) {
    const result = wouldYouRather();

    const embed = new EmbedBuilder()
      .setTitle("🤔 Would You Rather")
      .setDescription(result.sentence)
      .addFields(
        { name: "Option 1️⃣", value: result.choices[0], inline: true },
        { name: "Option 2️⃣", value: result.choices[1], inline: true }
      )
      .setColor("Random");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("wyr_1").setLabel("1️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("wyr_2").setLabel("2️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("wyr_next").setLabel("🔄 Next").setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    if (!interaction.client.partySessions) interaction.client.partySessions = new Map();
    interaction.client.partySessions.set(message.id, { type: "wouldyourather", result });
  },
};
