const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes.js");
const { trivia, TRIVIA_CATEGORIES } = require("party-game-sentences");

module.exports = {
  data: new CommandBuilder()
    .setName("trivia")
    .setDescription("Play Trivia")
    .addStringOption(opt =>
      opt.setName("category")
        .setDescription("Optional trivia category")
        .setRequired(false)
        .addChoices(...TRIVIA_CATEGORIES.map(c => ({ name: c, value: c })))
    )
    .setCategory("Fun")
    .setType(CommandTypes.SLASH),

  async execute(interaction) {
    const cat = interaction.options.getString("category");
    const questionObj = cat && TRIVIA_CATEGORIES.includes(cat) ? trivia({ category: [cat] }) : trivia();

    const embed = new EmbedBuilder()
      .setTitle(`📚 Trivia — ${questionObj.category}`)
      .setDescription(questionObj.sentence)
      .addFields({ name: "Choices", value: questionObj.choices.map((c,i)=>`${i+1}️⃣ ${c}`).join("\n") })
      .setColor("Random");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("trivia_0").setLabel("1️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("trivia_1").setLabel("2️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("trivia_2").setLabel("3️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("trivia_3").setLabel("4️⃣").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("trivia_next").setLabel("🔄 Next").setStyle(ButtonStyle.Secondary)
    );

    const response = await interaction.reply({ embeds: [embed], components: [row], withResponse: true });

    if (!interaction.client.partySessions) interaction.client.partySessions = new Map();
    interaction.client.partySessions.set(response.resource.message.id, { type: "trivia", questionObj });
  },
};
