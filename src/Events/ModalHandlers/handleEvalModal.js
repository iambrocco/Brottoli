const { EmbedBuilder } = require("discord.js");
const { inspect } = require("util");
const vm = require("vm");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js")
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @returns
   */
  async execute(client, interaction) {
    if (interaction.isModalSubmit() && interaction.customId == "evalModal") {
      const code = await interaction.fields.getTextInputValue("codeInput");
      let evaled;

      try {
        evaled = await vm.runInNewContext(code);
      } catch (err) {
        const errEmbed = new ErrorEmbed()
          .setError({
            name: "Error while evaluating",
            value: `\`\`\`bash\n${err}\n\`\`\``,
          })
          .setTimestamp();

        return interaction.reply({ embeds: [errEmbed] });
      }

      const output = inspect(evaled, { depth: 0 });

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Eval Result")
        .addFields(
          { name: "Input", value: `\`\`\`js\n${code}\n\`\`\`` },
          {
            name: "Output",
            value: `\`\`\`js\n${output}\n\`\`\``,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
