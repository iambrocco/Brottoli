const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes.js");
const { truthOrDare } = require("party-game-sentences");

module.exports = {
  data: new CommandBuilder()
    .setName("truthordare")
    .setDescription("Play Truth or Dare")
    .addStringOption(opt =>
      opt.setName("choice")
        .setDescription("Truth or Dare?")
        .setRequired(true)
        .addChoices(
          { name: "Truth", value: "truth" },
          { name: "Dare", value: "dare" },
          { name: "Random", value: "random" },
        )
    )
    .setCategory("Fun")
    .setType(CommandTypes.SLASH),

  async execute(interaction) {
    const choice = interaction.options.getString("choice") == "random" ? (Math.random() < 0.5 ? "truth" : "dare") : interaction.options.getString("choice");
    const sentence = truthOrDare(choice);

    const embed = new EmbedBuilder()
      .setTitle(`🎯 Truth or Dare — ${choice.charAt(0).toUpperCase() + choice.slice(1)}`)
      .setDescription(sentence)
      .setColor("Random");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`truthordare_truth_${choice}`)
        .setLabel("Truth")
        .setStyle(ButtonStyle.Success)
    ).addComponents(
      new ButtonBuilder()
        .setCustomId(`truthordare_dare_${choice}`)
        .setLabel("Dare")
        .setStyle(ButtonStyle.Danger)

    ).addComponents(
      new ButtonBuilder()
        .setCustomId(`truthordare_random_${choice}`)
        .setLabel("Random")
        .setStyle(ButtonStyle.Primary)

    )

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    if (!interaction.client.partySessions) interaction.client.partySessions = new Map();
    interaction.client.partySessions.set(message.id, { type: "truthordare", choice });
  },
};
