// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ms = require("ms");

module.exports = {
  data: new CommandBuilder()
    .setName("mute")
    .setDescription("Mute a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH) 
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
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
      option.setName("reason").setDescription("Why are you muting this person?")
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
    memberOption.moderatable &&
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
        })();
  },
};
