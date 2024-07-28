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
    .setName("kick")
    .setDescription("Kick a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setType(CommandTypes.SLASH)

    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Why are you kicking this user?")
    ),
  async execute(interaction) {
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    let reason = !interaction.options.getString("reason")
      ? "No Reason Provided"
      : interaction.options.getString("reason");
    memberOption.kickable && interaction.memberPermissions.has("KickMembers")
      ? (() => {
          memberOption.kick(reason);
          interaction.reply({
            embeds: [
              feedBackEmbed.setTitle("User Kicked Successfully").addFields(
                {
                  name: "User Successfully Kicked",
                  value: `${memberOption} was successfully kicked`,
                },
                { name: "Reason", value: `${reason}` }
              ),
            ],
          });
        })()
      : (() => {
          feedBackEmbed
            .setColor(Colors.Red)
            .setTitle("Failed To Kick Member")
            .addFields({
              name: "Error",
              value: "Insufficient Permissions!",
            });
          interaction.reply({ embeds: [feedBackEmbed] });
        })();
  },
};
