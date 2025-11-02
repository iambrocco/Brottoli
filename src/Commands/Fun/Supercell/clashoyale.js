const { EmbedBuilder, Colors } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes.js");
require("dotenv").config();

const API_BASE = "https://proxy.royaleapi.dev/v1";
const API_KEY = process.env.cr_api;
const cardColors = {
    "common": Colors.Grey,
    "rare": Colors.Blue,
    "epic": Colors.Purple,
    "legendary": Colors.Blurple,
    "champion": Colors.Orange
};
module.exports = {
    data: new CommandBuilder()
        .setName("clashroyale")
        .setDescription("All Clash Royale-related commands")
        .setCategory("Supercell")
        .setType(CommandTypes.BOTH)

        // 👤 Player subcommands
        .addSubcommandGroup(group =>
            group
                .setName("player")
                .setDescription("Player-related commands")
                .addSubcommand(sub =>
                    sub
                        .setName("info")
                        .setDescription("Get information about a player")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Player tag (include #)").setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName("battlelog")
                        .setDescription("Get a player's recent battles")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Player tag (include #)").setRequired(true)
                        )
                )
        )

        // 🏰 Clan subcommands
        .addSubcommandGroup(group =>
            group
                .setName("clan")
                .setDescription("Clan-related commands")
                .addSubcommand(sub =>
                    sub
                        .setName("info")
                        .setDescription("Get information about a clan")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Clan tag (include #)").setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName("members")
                        .setDescription("List all clan members")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Clan tag (include #)").setRequired(true)
                        )
                )
        )

        // 🃏 Card subcommands
        .addSubcommandGroup(group =>
            group
                .setName("card")
                .setDescription("Card-related commands")
                .addSubcommand(sub =>
                    sub
                        .setName("info")
                        .setDescription("Get information about a card")
                        .addStringOption(opt =>
                            opt.setName("name").setDescription("Card name").setRequired(true)
                        )
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        try {
            // 🧩 PLAYER COMMANDS
            if (subcommandGroup === "player") {
                const tag = encodeURIComponent(interaction.options.getString("tag"));

                // Player Info
                if (subcommand === "info") {
                    const response = await fetch(`${API_BASE}/players/${tag}`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });

                    if (!response.ok)
                        return interaction.editReply("❌ Invalid player tag or API error.");

                    const player = await response.json();

                    const deckCardKeys = player.currentDeck?.map(c => c.idName) || [];
                    const deckImage = deckCardKeys.length
                        ? `https://royaleapi.github.io/cr-api-assets/deck/${deckCardKeys.join(",")}.png`
                        : null;

                    const embed = new EmbedBuilder()
                        .setTitle(`${player.name} (${player.tag})`)
                        .setColor(Colors.Blue)
                        .setThumbnail(player.arena?.iconUrls?.medium)
                        .addFields(
                            { name: "Level", value: `${player.expLevel}`, inline: true },
                            { name: "Trophies", value: `${player.trophies}`, inline: true },
                            { name: "Best Trophies", value: `${player.bestTrophies}`, inline: true },
                            { name: "Wins", value: `${player.wins}`, inline: true },
                            { name: "Losses", value: `${player.losses}`, inline: true },
                            {
                                name: "Clan",
                                value: player.clan
                                    ? `${player.clan.name} (${player.clan.tag})`
                                    : "No Clan",
                                inline: false,
                            }
                        )
                        .setFooter({ text: `Arena: ${player.arena?.name}` });
                    if (deckImage) embed.setImage(deckImage);

                    return interaction.editReply({ embeds: [embed] });
                }

                // Player Battlelog
                if (subcommand === "battlelog") {
                    const response = await fetch(`${API_BASE}/players/${tag}/battlelog`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!response.ok)
                        return interaction.editReply("❌ Failed to fetch recent battles.");
                    const battles = await response.json();

                    const latest = battles.slice(0, 5);
                    const description = latest
                        .map(b =>
                            `🏆 **${b.team[0].name}** (${b.team[0].crowns}) vs **${b.opponent[0].name}** (${b.opponent[0].crowns})`
                        )
                        .join("\n");

                    const embed = new EmbedBuilder()
                        .setTitle(`⚔️ Recent Battles for ${tag}`)
                        .setColor(Colors.Purple)
                        .setDescription(description || "No recent battles found.");

                    return interaction.editReply({ embeds: [embed] });
                }
            }

            // 🏰 CLAN COMMANDS
            if (subcommandGroup === "clan") {
                const tag = encodeURIComponent(interaction.options.getString("tag"));

                // Clan Info
                if (subcommand === "info") {
                    const response = await fetch(`${API_BASE}/clans/${tag}`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!response.ok)
                        return interaction.editReply("❌ Invalid clan tag or API error.");
                    const clan = await response.json();

                    const embed = new EmbedBuilder()
                        .setTitle(`${clan.name} (${clan.tag})`)
                        .setColor(Colors.Green)
                        .setThumbnail(clan.badgeUrls?.medium)
                        .addFields(
                            { name: "Members", value: `${clan.members}/50`, inline: true },
                            { name: "Score", value: `${clan.clanScore}`, inline: true },
                            { name: "Type", value: `${clan.type}`, inline: true },
                            { name: "Description", value: clan.description || "No description" }
                        );

                    return interaction.editReply({ embeds: [embed] });
                }

                // Clan Members
                if (subcommand === "members") {
                    const response = await fetch(`${API_BASE}/clans/${tag}/members`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!response.ok)
                        return interaction.editReply("❌ Failed to get clan members.");
                    const data = await response.json();

                    const members = data.items
                        .map((m, i) => `${i + 1}. ${m.name} (${m.tag}) — 🏆 ${m.trophies}`)
                        .join("\n");

                    const embed = new EmbedBuilder()
                        .setTitle(`👥 Members of ${tag}`)
                        .setColor(Colors.Green)
                        .setDescription(members || "No members found.");

                    return interaction.editReply({ embeds: [embed] });
                }
            }

            // 🃏 CARD COMMANDS
            if (subcommandGroup === "card") {
                if (subcommand === "info") {
                    const name = interaction.options.getString("name").toLowerCase();
                    const response = await fetch(`${API_BASE}/cards`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!response.ok)
                        return interaction.editReply("❌ Failed to fetch cards list.");
                    const data = await response.json();
                    const card = data?.items.find(c => c.name.toLowerCase() === name);

                    if (!card)
                        return interaction.editReply("⚠️ Card not found.");

                    const embed = new EmbedBuilder()
                        .setTitle(`🃏 ${card.name}`)
                        .setColor(cardColors[card.rarity.toString().toLowerCase()] || Colors.DarkAqua)
                        .setThumbnail(card.iconUrls?.medium)
                        .addFields(
                            { name: "Rarity", value: card.rarity, inline: true },
                            { name: "Elixir Cost", value: `${card.elixirCost}`, inline: true },
                        );

                    return interaction.editReply({ embeds: [embed] });
                }
            }

        } catch (err) {
            console.error(err);
            return interaction.editReply("⚠️ An error occurred while processing your request.");
        }
    },
};
