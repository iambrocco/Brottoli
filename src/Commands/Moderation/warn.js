// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ms = require("ms");

module.exports = {
  data: new CommandBuilder()
    .setName("warn")
    .setDescription("Warn a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH)

    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Warn")
        .setRequired(true)
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    let reason = !interaction.options.getString("reason")
      ? "No Reason Provided"
      : interaction.options.getString("reason");
    (() => {
      interaction.reply(`To be Implented...`);
    })();
  },
};
