const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags, InteractionContextType, ApplicationIntegrationType
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
module.exports = {
  data: new CommandBuilder()
    .setName("config")
    .setDescription("Configuration Command")
    .setType(CommandTypes.SLASH)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addSubcommand((command) =>
      command
        .setName("join_leave")
        .setDescription(`Setup The Automated Join/Leave messages`)
    )
    .setCategory("Moderation"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.client.isDatabaseConnected()) return interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({ name: 'Database Error', value: 'The database is not connected.' })] });

    interaction.client.db.query(`UPDATE guilds SET customConfig = 1 WHERE guildId = ?`, [interaction.guildId]);
    if (interaction.options.getSubcommand() == "join_leave") {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setValue(`1`)
                  .setLabel("Enabled")
                  .setDescription(`Enable Join/Leave Messages In This Server`),
                new StringSelectMenuOptionBuilder()
                  .setValue(`0`)
                  .setLabel("Disabled")
                  .setDescription(`Disable Join/Leave Messages In This Server`)
              )
              .setCustomId(`enablejl`)
              .setPlaceholder("Do You Want Join/Leave Messages?")
          ),
        ],
      });
    }
  },
};
