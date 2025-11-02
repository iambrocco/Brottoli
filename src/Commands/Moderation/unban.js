// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
module.exports = {
  data: new CommandBuilder()
    .setName("unban")
    .setDescription("Unban a Member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setCategory("Moderation")
    .setType(CommandTypes.SLASH)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Unban")
        .setRequired(true)
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    /**
     * @type {GuildMember}
     */
    const userOption = interaction.options.getMentionable("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    let reason = !interaction.options.getString("reason")
      ? "No Reason Provided"
      : interaction.options.getString("reason");
    interaction.guild.bans.fetch(userOption) &&
    interaction.memberPermissions.has("BanMembers")
      ? (() => {
          interaction.guild.bans
            .fetch(userOption)
            .then((bans) => {
              bans.guild.bans.remove(userOption);
              interaction.reply({
                embeds: [
                  feedBackEmbed
                    .setTitle("User Unanned Successfully")
                    .addFields({
                      name: "User Successfully Unbanned",
                      value: `${userOption} was successfully Unbanned`,
                    }),
                ],
              });
            })
            .catch((err) =>
              interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                  new ErrorEmbed().setError({
                    name: "An Error Occured",
                    value: `${err}`,
                  }),
                ],
              })
            );
        })()
      : (() => {
          feedBackEmbed
            .setColor(Colors.Red)
            .setTitle("Failed To Unban Member")
            .addFields({
              name: "Error",
              value: "Either User is Not Banned or Insufficient Permissions!",
            });
          interaction.reply({ embeds: [feedBackEmbed] });
        })();
  },
};
