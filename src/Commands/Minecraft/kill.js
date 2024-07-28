// Import
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const { Colors, EmbedBuilder } = require("discord.js");
const mcData = require("../../Data/minecraft.json");
// Creating the command
module.exports = {
  // Exporting the Data
  data: new CommandBuilder()
    .setCategory("Minecraft")
    .setType(CommandTypes.SLASH)
    .setName("mckill")
    .setDescription("Kill Someone With a Minecraft Death Message"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Array} args
   */
  async execute(interaction) {
    let mentionedUser = interaction.options.getMentionable("user")
      ? interaction.options.getMentionable("user")
      : interaction.user;
    let deathMessages = mcData.Death_Messages;
    let killEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle("Uh Oh..!")
      .setDescription("You have been killed!");
    let killer = interaction.user.displayName;
    let killed = mentionedUser;
    let killMethod = "[*Brocco Sword*]";
    let currentMessage = deathMessages[
      Math.floor(Math.random() * deathMessages.length)
    ].replace("%1$s", killed);
    let newCM_s2 = currentMessage.includes("%2$s")
      ? currentMessage.replace("%2$s", killer)
      : currentMessage;
    let newCM_s3 = newCM_s2.includes("%3$s")
      ? newCM_s2.replace("%3$s", killMethod)
      : newCM_s2;
    killEmbed.addFields({
      name: `${killer} killed you!`,
      value: `${newCM_s3}`,
    });
    await interaction.reply({ embeds: [killEmbed] });
  },
};
