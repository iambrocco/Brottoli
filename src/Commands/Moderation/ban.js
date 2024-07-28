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
    .setName("ban")
    .setDescription("Ban a Member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("How back should messages be deleted?")
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Why are you banning this user?")
    )
    .setCategory("Moderation")
    .setType(CommandTypes.SLASH),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    let reason = !interaction.options.getString("reason")
      ? "No Reason Provided"
      : interaction.options.getString("reason");
    memberOption.bannable && interaction.memberPermissions.has("BanMembers")
      ? (() => {
          let duration = !interaction.options.getString("duration")
            ? 0
            : interaction.options.getString("duration");
          let dur = isNaN(duration)
            ? parseInt(ms(duration))
            : parseInt(duration) * 1000;

          memberOption.ban({ deleteMessageSeconds: dur, reason: reason });
          interaction.reply({
            embeds: [
              feedBackEmbed.setTitle("User Banned Successfully").addFields(
                {
                  name: "User Successfully Banned",
                  value: `${memberOption} was successfully banned`,
                },
                { name: "Reason", value: `${reason}` }
              ),
            ],
          });
        })()
      : (() => {
          feedBackEmbed
            .setColor(Colors.Red)
            .setTitle("Failed To Ban Member")
            .addFields({
              name: "Error",
              value: "Insufficient Permissions!",
            });
          interaction.reply({ embeds: [feedBackEmbed] });
        })();
  },
};
