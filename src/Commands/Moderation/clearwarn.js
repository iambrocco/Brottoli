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
    .setName("clearwarn")
    .setDescription("Clear or remove a member's warnings")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH) 
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .addMentionableOption(option =>
      option
        .setName("user")
        .setDescription("The user whose warnings you want to clear")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("amount")
        .setDescription(`Amount to remove (integer or "all")`)
        .setRequired(false)
    ),

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const client = interaction.client;
    if (!client.isDatabaseConnected()) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new ErrorEmbed().setError({
            name: "Database Error",
            value: "The database is not connected."
          })
        ]
      });
    }

    const memberOption = interaction.options.getMentionable("user");
    const amountInput = interaction.options.getString("amount") ?? "all";
    const amount = isNaN(parseInt(amountInput)) ? amountInput : parseInt(amountInput);

    if (isNaN(amount) && amount !== "all") {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `**Please specify a valid amount (\`all\` or a number).**`
      });
    }

    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);

    client.query(
      "SELECT * FROM warns WHERE userId = ? AND guildId = ?",
      [memberOption.id, interaction.guildId],
      (err, results) => {
        if (err) {
          console.error(err);
          return interaction.reply("An error occurred while processing your command.");
        }

        const result = results[0];
        if (!result) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`❌ Member has no warnings!`)
            ],
            flags: MessageFlags.Ephemeral
          });
        }

        if (amount === "all") {
          // Delete all warnings
          client.query(
            "DELETE FROM warns WHERE userId = ? AND guildId = ?",
            [memberOption.id, interaction.guildId],
            err => {
              if (err) {
                console.error(err);
                return interaction.reply("Failed to clear warnings.");
              }
              sendUnwarnEmbed(0, true);
            }
          );
        } else {
          // Decrease warning count
          const newCount = Math.max(0, result.count - Math.abs(amount));
          let splitReasons = result.reason ? result.reason.split(",") : [];

          // Keep the most recent warnings only
          splitReasons = splitReasons.slice(0, newCount);
          const newReason = splitReasons.join(",");

          if (newCount === 0) {
            client.query(
              "DELETE FROM warns WHERE userId = ? AND guildId = ?",
              [memberOption.id, interaction.guildId],
              err => {
                if (err) {
                  console.error(err);
                  return interaction.reply("Failed to clear warnings.");
                }
                sendUnwarnEmbed(0, true);
              }
            );
          } else {
            client.query(
              "UPDATE warns SET count = ?, reason = ? WHERE userId = ? AND guildId = ?",
              [newCount, newReason, memberOption.id, interaction.guildId],
              err => {
                if (err) {
                  console.error(err);
                  return interaction.reply("Failed to update warnings.");
                }
                sendUnwarnEmbed(newCount);
              }
            );
          }
        }

        function sendUnwarnEmbed(count, clearedAll = false) {
          const title = clearedAll
            ? `⚠️ Cleared all warnings for ${memberOption.user.username}`
            : `✅ Removed warning(s) from ${memberOption.user.username}`;

          feedBackEmbed
            .setTitle(title)
            .addFields({
              name: "Member now has:",
              value: `${count} warning${count === 1 ? "" : "s"}`
            });

          interaction.reply({ embeds: [feedBackEmbed] });
        }
      }
    );
  }
};
