const { Message } = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder");

module.exports = {
  data: new CommandBuilder()
    .setName("say")
    .setDescription("Makes the bot say something")
    .addStringOption((option) =>
      option.setName("text").setDescription("what to say").setRequired(true)
    )
    .setType("BOTH")
    .setCategory("Fun"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Array} args
   */
  async execute(interaction, args) {
    let text = interaction.content
      ? interaction.content.replace(
          `${interaction.client.textCommandsPrefix + args[0]} `,
          ""
        )
      : interaction.options.getString("text");
    interaction.content
      ? interaction.delete()
      : interaction.reply({ ephemeral: true, content: "done!" });
    
    interaction.channel.send(`${text}`);
  },
};
