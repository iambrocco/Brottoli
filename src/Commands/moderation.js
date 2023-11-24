// Import
const { GuildMember, EmbedBuilder, Colors } = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const ms = require("ms");

module.exports = {
  data: new CommandBuilder()
    .setName("moderation")
    .setCategory("Moderation")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("purge")
        .setDescription("Delete a Number of Message")
        .addNumberOption((option) =>
          option
            .setName("amount")
            .setDescription("The Amount of messages you want to delete")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kick")
        .setDescription("Kick a Member")
        .addMentionableOption((option) =>
          option
            .setName("user")
            .setDescription("The User You Want to Kick")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why are you kicking this user?")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ban")
        .setDescription("Ban a Member")
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
          option
            .setName("reason")
            .setDescription("Why are you banning this user?")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unban")
        .setDescription("Unban a Member")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The User You Want to Unban")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("warn")
        .setDescription("Warn a Member")
        .addMentionableOption((option) =>
          option
            .setName("user")
            .setDescription("The User You Want to Warn")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("mute")
        .setDescription("Mute a Member")
        .addMentionableOption((option) =>
          option
            .setName("user")
            .setDescription("The User You Want to Mute")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("How long should the user be muted?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why are you muting this person?")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unmute")
        .setDescription("Unmute a Member")
        .addMentionableOption((option) =>
          option
            .setName("user")
            .setDescription("The User You Want to Unmute")
            .setRequired(true)
        )
    )
    .setType("SLASH")
    .setDescription("Moderation Commands"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const userOption = interaction.options.getUser("user");
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    let reason = !interaction.options.getString("reason")
      ? "No Reason Provided"
      : interaction.options.getString("reason");
    subCommand == "kick"
      ? memberOption.kickable &&
        interaction.memberPermissions.has("KickMembers")
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
          })()
      : subCommand == "ban"
      ? memberOption.bannable && interaction.memberPermissions.has("BanMembers")
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
          })()
      : subCommand == "unban"
      ? interaction.guild.bans.fetch(userOption) &&
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
              .catch((err) => console.log(err));
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
          })()
      : subCommand == "warn"
      ? (() => {
          interaction.reply(`To be Implented...`);
        })()
      : subCommand == "mute"
      ? memberOption.moderatable &&
        interaction.memberPermissions.has("ModerateMembers")
        ? (() => {
            let duration = interaction.options.getString("duration");
            let dur = isNaN(duration)
              ? parseInt(ms(duration))
              : parseInt(duration) * 1000;
            duration.length > 1
              ? (() => {
                  dur >= 28 * 24 * 60 * 60 * 1000
                    ? (() => {
                        feedBackEmbed
                          .setColor(Colors.Red)
                          .setTitle("Failed To Mute Member")
                          .addFields({
                            name: "Error",
                            value: "Duration Too Long!",
                          });
                        interaction.reply({ embeds: [feedBackEmbed] });
                      })()
                    : (() => {
                        memberOption.timeout(dur, reason);
                        interaction.reply({
                          embeds: [
                            feedBackEmbed
                              .setTitle("Member Muted Successfully")
                              .addFields(
                                {
                                  name: "User Successfully Muted",
                                  value: `${memberOption} was successfully muted for ${ms(
                                    dur
                                  )}`,
                                },
                                { name: "Reason", value: `${reason}` }
                              ),
                          ],
                        });
                      })();
                })()
              : (() => {
                  feedBackEmbed
                    .setColor(Colors.Red)
                    .setTitle("Failed To Mute Member")
                    .addFields({
                      name: "Error",
                      value: "Duration Too Short!",
                    });
                  interaction.reply({ embeds: [feedBackEmbed] });
                })();
          })()
        : (() => {
            feedBackEmbed
              .setColor(Colors.Red)
              .setTitle("Failed To Mute Member")
              .addFields({
                name: "Error",
                value: "Insufficient Permissions!",
              });
            interaction.reply({ embeds: [feedBackEmbed] });
          })()
      : subCommand == "unmute"
      ? memberOption.manageable &&
        interaction.memberPermissions.has("ModerateMembers")
        ? (() => {
            memberOption.timeout(1);
            interaction.reply({
              embeds: [
                feedBackEmbed
                  .setTitle("Member Unmuted Successfully")
                  .addFields({
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
          })()
      : subCommand == "purge"
      ? (async () => {
          let amount = interaction.options.getNumber("amount");
          async function purge(amount) {
            await interaction.channel.bulkDelete(amount, true).then(async () => {
              await interaction
                .reply(`Successfully Deleted ${amount} messages`)
                .then((message) => {
                  setTimeout(() => {
                    message.delete();
                  }, 2500);
                });
              await interaction.followUp({
                content: `Messages Older than 14 days can't be deleted by Bots because of Discord's API Limit.`,
                ephemeral: true,
              });
            });
          }
          amount
            ? amount <= 0 || amount > 100
              ? interaction.reply(
                  "Please Provide a Value Larger than 0 and Less Than 100"
                )
              : await purge(amount)
            : interaction.reply("Please Provide a Value");
        })()
      : interaction.reply("Unimplemented Subcommand!");
  },
};
