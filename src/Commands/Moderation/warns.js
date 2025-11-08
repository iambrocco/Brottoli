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
        .setName("warns")
        .setDescription("View warnings in the server or for a specific user")
        .setCategory("Moderation")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setType(CommandTypes.SLASH)
        .addMentionableOption(option =>
            option
                .setName("user")
                .setDescription("View warnings for this user only")
                .setRequired(false)
        )
        .setContexts([InteractionContextType.Guild])
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    /**
     * @param {import('discord.js').CommandInteraction} interaction
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

        const targetUser = interaction.options.getMentionable("user");

        if (targetUser) {
            // ✅ View specific user's warnings
            return this.viewUserWarns(interaction, targetUser);
        } else {
            // ✅ View all warnings in the server
            return this.viewAllWarns(interaction);
        }
    },

    // ✅ Show warnings for a single user
    async viewUserWarns(interaction, user) {
        const client = interaction.client;

        client.db.query(
            "SELECT * FROM warns WHERE userId = ? AND guildId = ?",
            [user.id, interaction.guildId],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: "An error occurred.", flags: MessageFlags.Ephemeral });
                }

                if (!results.length) {
                    return interaction.reply({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Blue)
                                .setTitle(`✅ ${user.user?.username || user.id} has no warnings`)
                        ]
                    });
                }

                const entry = results[0];
                const reasons = entry.reason
                    ? entry.reason.split(",").map(r => `• ${r}`).join("\n")
                    : "No reason data";

                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`⚠️ Warnings for ${user.user?.username || user.id}`)
                    .addFields(
                        { name: "Total Warnings", value: `${entry.count}` },
                        { name: "Reasons", value: reasons }
                    )
                    .setTimestamp();

                interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        );
    },

    // ✅ Show ALL warnings in the server
    async viewAllWarns(interaction) {
        const client = interaction.client;

        client.db.query(
            "SELECT * FROM warns WHERE guildId = ?",
            [interaction.guildId],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: "An error occurred.", flags: MessageFlags.Ephemeral });
                }

                if (!results.length) {
                    return interaction.reply({
                        flags: MessageFlags.Ephemeral,
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Blue)
                                .setTitle("✅ This server has no warnings!")
                        ]
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`📄 Server Warnings (${results.length} users)`)
                    .setTimestamp();

                for (const entry of results) {
                    const member = await interaction.guild.members
                        .fetch(entry.userId)
                        .catch(() => null);

                    const name = member
                        ? `${member.user.username} (${entry.userId})`
                        : `Unknown User (${entry.userId})`;

                    const reasons = entry.reason
                        ? entry.reason.split(",").map(r => `• ${r}`).join("\n")
                        : "No reasons stored";

                    embed.addFields({
                        name: name,
                        value: `**Warnings:** ${entry.count}\n${reasons}`,
                        inline: false
                    });
                }

                interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        );
    }
};
