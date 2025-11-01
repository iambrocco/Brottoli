// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");

module.exports = {
  data: new CommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH)
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Unmute")
        .setRequired(true)
    ),
  async execute(interaction) {
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);

    memberOption.manageable &&
    interaction.memberPermissions.has("ModerateMembers")
      ? (() => {
          memberOption.timeout(1);
          interaction.reply({
            embeds: [
              feedBackEmbed.setTitle("Member Unmuted Successfully").addFields({
                name: "User Successfully Unmuted",
                value: `${memberOption} was successfully Unmuted`,
              }),
            ],
          });
        })()
      : (() => {
          feedBackEmbed
            .setColor(Colors.Red)
            .setTitle("Failed To Unmute Member")
            .addFields({
              name: "Error",
              value: "Insufficient Permissions!",
            });
          interaction.reply({ embeds: [feedBackEmbed] });
        })();
  },
};
