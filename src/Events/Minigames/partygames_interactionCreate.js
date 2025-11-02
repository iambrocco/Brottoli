const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, MessageFlags } = require("discord.js");
const { neverHaveIEver, truthOrDare, wouldYouRather, trivia, TRIVIA_CATEGORIES } = require("party-game-sentences");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * 
   * @param {import("discord.js").Interaction} interaction 
   */
  async execute(client, interaction) {
    if (!interaction.isButton()) return;

    if (!client.partySessions) return;
    const session = client.partySessions.get(interaction.message.id);
    if (!session) return;

    let embed = new EmbedBuilder().setColor("Random");
    let row = new ActionRowBuilder();

    // NEVER HAVE I EVER
    if (session.type === "neverhaveiever" && interaction.customId === "neverhaveiever_next") {
      embed.setTitle("🎲 Never Have I Ever")
        .setDescription(neverHaveIEver());
      row.addComponents(new ButtonBuilder().setCustomId("neverhaveiever_next").setLabel("Next").setStyle(ButtonStyle.Primary));
      await interaction.update({ embeds: [embed], components: [row] });
    }

    // TRUTH OR DARE
    else if (session.type === "truthordare" && interaction.customId.startsWith("truthordare")) {
      const parts = interaction.customId.split("_");
      // parts = ["truthordare", "truth/dare/random", "<originalChoice>"]
      let selectedType = parts[1];

      // Generate new sentence based on selectedType
      const sentence = truthOrDare(selectedType === "random" ? (selectedType = Math.random() < 0.5 ? "truth" : "dare") : selectedType);

      const embed = new EmbedBuilder()
        .setTitle(`🎯 Truth or Dare — ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`)
        .setDescription(sentence)
        .setColor("Random");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`truthordare_truth_${selectedType}`).setLabel("Truth").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`truthordare_dare_${selectedType}`).setLabel("Dare").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`truthordare_random_${selectedType}`).setLabel("Random").setStyle(ButtonStyle.Primary)
      );

      await interaction.update({ embeds: [embed], components: [row] });
    }


    // WOULD YOU RATHER
    else if (session.type === "wouldyourather") {
      if (interaction.customId === "wyr_next") {
        const result = wouldYouRather();
        session.result = result;
        embed.setTitle("🤔 Would You Rather")
          .setDescription(result.sentence)
          .addFields(
            { name: "Option 1️⃣", value: result.choices[0], inline: true },
            { name: "Option 2️⃣", value: result.choices[1], inline: true }
          );
      } else if (interaction.customId === "wyr_1" || interaction.customId === "wyr_2") {
        await interaction.reply({ content: `You chose option ${interaction.customId.slice(-1)} ✅`, flags: MessageFlags.Ephemeral });
        return;
      }
      row.addComponents(
        new ButtonBuilder().setCustomId("wyr_1").setLabel("1️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("wyr_2").setLabel("2️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("wyr_next").setLabel("🔄 Next").setStyle(ButtonStyle.Secondary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    }

    // TRIVIA
    else if (session.type === "trivia") {
      const questionObj = session.questionObj;
      if (interaction.customId === "trivia_next") {
        const newQuestion = trivia({ categories: [questionObj.category ?? Math.floor(Math.random() * Array.from(TRIVIA_CATEGORIES).length)] });
        session.questionObj = newQuestion;
        embed.setTitle(`📚 Trivia — ${newQuestion.category}`)
          .setDescription(newQuestion.sentence)
          .addFields({ name: "Choices", value: newQuestion.choices.map((c, i) => `${i + 1}️⃣ ${c}`).join("\n") });
      } else if (interaction.customId.startsWith("trivia_")) {
        const idx = parseInt(interaction.customId.split("_")[1]);
        const correct = questionObj.choices[idx] === questionObj.correct;
        await interaction.reply({ content: `${interaction.user} answered ${questionObj.choices[idx]} — ${correct ? "✅ Correct" : `❌ Wrong (Correct: ${questionObj.correct})`}`, flags: MessageFlags.Ephemeral });
        return;
      }
      row.addComponents(
        new ButtonBuilder().setCustomId("trivia_0").setLabel("1️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("trivia_1").setLabel("2️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("trivia_2").setLabel("3️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("trivia_3").setLabel("4️⃣").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("trivia_next").setLabel("🔄 Next").setStyle(ButtonStyle.Secondary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    }
  }
};
