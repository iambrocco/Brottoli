const { EmbedBuilder, Colors } = require("discord.js");
const CommandBuilder = require("../../../Structures/CommandBuilder.js");
const CommandTypes = require("../../../Structures/Enums/CommandTypes");
require("dotenv").config();

const API_BASE = "https://cocproxy.royaleapi.dev/v1";
const API_KEY = process.env.coc_api; // your Clash of Clans API key

module.exports = {
    data: new CommandBuilder()
        .setName("clashofclans")
        .setDescription("All Clash of Clans-related commands")
        .setCategory("Supercell")
        .setType(CommandTypes.BOTH)

        // 👤 Player Subcommands
        .addSubcommandGroup(group =>
            group
                .setName("player")
                .setDescription("Player-related commands")
                .addSubcommand(sub =>
                    sub
                        .setName("info")
                        .setDescription("Get information about a Clash of Clans player")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Player tag (Include #)").setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName("army")
                        .setDescription("Get a player's army composition (troops, spells, heroes)")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Player tag (Include #)").setRequired(true)
                        )
                )
        )

        // 🏰 Clan Subcommands
        .addSubcommandGroup(group =>
            group
                .setName("clan")
                .setDescription("Clan-related commands")
                .addSubcommand(sub =>
                    sub
                        .setName("info")
                        .setDescription("Get information about a Clash of Clans clan")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Clan tag (Include #)").setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName("members")
                        .setDescription("List all clan members")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Clan tag (Include #)").setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub
                        .setName("war")
                        .setDescription("Get current or recent clan war status")
                        .addStringOption(opt =>
                            opt.setName("tag").setDescription("Clan tag (Include #)").setRequired(true)
                        )
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        try {
            // PLAYER COMMANDS
            if (subcommandGroup === "player") {
                const tag = encodeURIComponent(interaction.options.getString("tag"));

                // Player Info
                if (subcommand === "info") {
                    const res = await fetch(`${API_BASE}/players/${tag}`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!res.ok)
                        return interaction.editReply("❌ Invalid player tag or API error.");
                    const player = await res.json();

                    const embed = new EmbedBuilder()
                        .setTitle(`${player.name} (${player.tag})`)
                        .setColor(Colors.Blue)
                        .setThumbnail(player.league?.iconUrls?.medium)
                        .addFields(
                            { name: "Town Hall", value: `${player.townHallLevel}`, inline: true },
                            { name: "Exp Level", value: `${player.expLevel}`, inline: true },
                            { name: "Trophies", value: `${player.trophies}`, inline: true },
                            { name: "Best Trophies", value: `${player.bestTrophies}`, inline: true },
                            { name: "War Stars", value: `${player.warStars}`, inline: true },
                            { name: "Attack Wins", value: `${player.attackWins}`, inline: true },
                            { name: "Defense Wins", value: `${player.defenseWins}`, inline: true },
                            {
                                name: "Clan",
                                value: player.clan
                                    ? `${player.clan.name} (${player.clan.tag})`
                                    : "No Clan",
                                inline: false,
                            }
                        )
                        .setFooter({
                            text: player.league?.name
                                ? `League: ${player.league.name}`
                                : "Unranked Player",
                        });

                    return interaction.editReply({ embeds: [embed] });
                }

                // Player Army
                if (subcommand === "army") {
                    const res = await fetch(`${API_BASE}/players/${tag}`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!res.ok)
                        return interaction.editReply("❌ Invalid player tag or API error.");
                    const player = await res.json();

                    function splitEmbedField(title, content) {
                        if (!content) return [{ name: title, value: "None", inline: false }];

                        const chunks = [];
                        let current = "";

                        for (const line of content.split("\n")) {
                            // +1 for the newline character
                            if (current.length + line.length + 1 > 1024) {
                                chunks.push({ name: title, value: current, inline: false });
                                current = line;
                            } else {
                                current += current ? "\n" + line : line;
                            }
                        }

                        // push the remaining text
                        if (current) chunks.push({ name: title, value: current, inline: false });

                        return chunks;
                    }

                    // --- Example usage ---
                    const troopsText = player.troops
                        ?.filter(t => t.village === "home")
                        .map(t => `${t.name} — Lvl ${t.level}`)
                        .join("\n");

                    const spellsText = player.spells
                        ?.map(s => `${s.name} — Lvl ${s.level}`)
                        .join("\n");

                    const heroesText = player.heroes
                        ?.map(h => `${h.name} — Lvl ${h.level}`)
                        .join("\n");

                    const fields = [
                        ...splitEmbedField("🏹 Troops", troopsText),
                        ...splitEmbedField("✨ Spells", spellsText),
                        ...splitEmbedField("🦸 Heroes", heroesText),
                    ];

                    const embed = new EmbedBuilder()
                        .setTitle(`🪖 ${player.name}'s Army`)
                        .setColor(Colors.Purple)
                        .addFields(fields);

                    return interaction.editReply({ embeds: [embed] });
                }
            }

            // CLAN COMMANDS
            if (subcommandGroup === "clan") {
                const tag = encodeURIComponent(interaction.options.getString("tag"));

                // Clan Info
                if (subcommand === "info") {
                    const res = await fetch(`${API_BASE}/clans/${tag}`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!res.ok)
                        return interaction.editReply("❌ Invalid clan tag or API error.");
                    const clan = await res.json();

                    const embed = new EmbedBuilder()
                        .setTitle(`${clan.name} (${clan.tag})`)
                        .setColor(Colors.Green)
                        .setThumbnail(clan.badgeUrls?.medium)
                        .addFields(
                            { name: "Members", value: `${clan.members}/50`, inline: true },
                            { name: "Clan Level", value: `${clan.clanLevel}`, inline: true },
                            { name: "Clan Points", value: `${clan.clanPoints}`, inline: true },
                            { name: "War Wins", value: `${clan.warWins}`, inline: true },
                            { name: "Type", value: clan.type, inline: true },
                            { name: "Description", value: clan.description || "No Description" }
                        );

                    return interaction.editReply({ embeds: [embed] });
                }

                // Clan Members
                if (subcommand === "members") {
                    const res = await fetch(`${API_BASE}/clans/${tag}/members`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (!res.ok)
                        return interaction.editReply("❌ Failed to get clan members.");
                    const data = await res.json();

                    const members = data.items
                        .map(
                            (m, i) =>
                                `${i + 1}. ${m.name} (${m.tag}) — 🏆 ${m.trophies} — ${m.role}`
                        )
                        .join("\n");

                    const embed = new EmbedBuilder()
                        .setTitle(`👥 Members of ${data.items[0]?.clan?.name || tag}`)
                        .setColor(Colors.Green)
                        .setDescription(members || "No members found.");

                    return interaction.editReply({ embeds: [embed] });
                }

                // Clan War Info
                if (subcommand === "war") {
                    const res = await fetch(`${API_BASE}/clans/${tag}/currentwar`, {
                        headers: { Authorization: `Bearer ${API_KEY}` },
                    });
                    if (res.status === 404)
                        return interaction.editReply("⚔️ This clan is not currently in war.");
                    if (!res.ok)
                        return interaction.editReply("❌ Failed to get war info.");

                    const war = await res.json();

                    const embed = new EmbedBuilder()
                        .setTitle(`⚔️ Clan War: ${war.clan?.name} vs ${war.opponent?.name}`)
                        .setColor(Colors.Red)
                        .addFields(
                            { name: war.clan?.name, value: `Stars: ${war.clan.stars}\nAttacks: ${war.clan.attacks}\nDestruction: ${war.clan.destructionPercentage.toFixed(1)}%`, inline: true },
                            { name: war.opponent?.name, value: `Stars: ${war.opponent.stars}\nAttacks: ${war.opponent.attacks}\nDestruction: ${war.opponent.destructionPercentage.toFixed(1)}%`, inline: true }
                        )
                        .setFooter({ text: `State: ${war.state} | Team Size: ${war.teamSize}` });

                    return interaction.editReply({ embeds: [embed] });
                }
            }

        } catch (err) {
            console.error(err);
            return interaction.editReply("⚠️ An error occurred while processing your request.");
        }
    },
};
