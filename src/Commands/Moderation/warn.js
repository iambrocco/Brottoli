const {
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags, InteractionContextType, ApplicationIntegrationType
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const Client = require("../../Structures/Client.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");

module.exports = {
  data: new CommandBuilder()
    .setName("warn")
    .setDescription("Warn a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH) setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .addMentionableOption(option =>
      option
        .setName("user")
        .setDescription("The user you want to warn")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason of the warning")
        .setRequired(false)
    ),

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const client = interaction.client;
    const memberOption = interaction.options.getMentionable("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!client.isDatabaseConnected()) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new ErrorEmbed().setError({
            name: "Database Error",
            value: "The database is not connected.",
          }),
        ],
      });
    }

    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);

    client.db.query(
      "SELECT * FROM warns WHERE userId = ? AND guildId = ?",
      [memberOption.id, interaction.guildId],
      (err, results) => {
        if (err) {
          console.error(err);
          return interaction.reply("An error occurred while processing your command.");
        }

        const result = results[0];

        if (!result) {
          client.db.query(
            "INSERT INTO warns (userId, guildId, count, reason) VALUES (?, ?, ?, ?)",
            [memberOption.id, interaction.guildId, 1, reason],
            err => {
              if (err) {
                console.error(err);
                return interaction.reply("Failed to insert warn data.");
              }
              sendWarnEmbed(1);
            }
          );
        } else {
          const newCount = result.count + 1;
          const newReason =
            result.reason && result.reason.length > 0
              ? `${result.reason}, ${reason}`
              : reason;

          client.db.query(
            "UPDATE warns SET count = ?, reason = ? WHERE userId = ? AND guildId = ?",
            [newCount, newReason, memberOption.id, interaction.guildId],
            err => {
              if (err) {
                console.error(err);
                return interaction.reply("Failed to update warn data.");
              }
              sendWarnEmbed(newCount);
            }
          );
        }

        function sendWarnEmbed(count) {
          feedBackEmbed
            .setTitle(`✅ Warned ${memberOption.user.username}!`)
            .addFields(
              { name: "Reason:", value: reason },
              { name: "Total Warnings:", value: `${count} warning${count === 1 ? "" : "s"}` }
            );

          interaction.reply({ embeds: [feedBackEmbed] });
        }
      }
    );
  },
};
