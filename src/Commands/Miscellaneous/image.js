const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    ComponentType,
} = require('discord.js');
require('dotenv').config();
const CommandBuilder = require('../../Structures/CommandBuilder.js');
const CommandTypes = require('../../Structures/Enums/CommandTypes.js');

// ⚙️ Insert your Unsplash API access key here
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_KEY; // Store in .env for security

module.exports = {
    data: new CommandBuilder()
        .setName('image')
        .setDescription('Fetches a random or searched image.')
        .setCategory('Miscellaneous')
        .setType(CommandTypes.SLASH)
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('Search term for an image (e.g. "mountains", "cats"). Leave empty for random.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const query = interaction.options.getString('query');
        await interaction.deferReply();

        try {
            if (!UNSPLASH_ACCESS_KEY) {
                return interaction.editReply('❌ Missing Unsplash API key. Please configure `UNSPLASH_KEY` in your environment.');
            }

            // Build Unsplash API URL
            const endpoint = query
                ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`
                : `https://api.unsplash.com/photos/random?count=5&client_id=${UNSPLASH_ACCESS_KEY}`;

            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // Normalize data between random and search
            const results = Array.isArray(data) ? data : data.results;
            if (!results || !results.length) {
                return interaction.editReply(`❌ No images found for **${query || 'random'}**.`);
            }

            let index = 0;
            const total = results.length;

            const getEmbed = (i) => {
                const img = results[i];
                return new EmbedBuilder()
                    .setTitle(`📸 ${img.description || img.alt_description || 'Untitled'}`)
                    .setURL(img.links.html)
                    .setColor(Colors.Blue)
                    .setImage(img.urls.regular)
                    .setFooter({
                        text: `Photo by ${img.user.name} — ${i + 1}/${total}`,
                        iconURL: img.user.profile_image?.small || null,
                    })
                    .setTimestamp();
            };

            const getButtons = (i) =>
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️ Prev')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(i === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(i === total - 1)
                );

            const msg = await interaction.editReply({
                embeds: [getEmbed(index)],
                components: [getButtons(index)],
            });

            // Handle pagination
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000,
            });

            collector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id)
                    return btnInt.reply({ content: '❌ Only the command user can use these buttons.', ephemeral: true });

                if (btnInt.customId === 'prev' && index > 0) index--;
                else if (btnInt.customId === 'next' && index < total - 1) index++;

                await btnInt.update({
                    embeds: [getEmbed(index)],
                    components: [getButtons(index)],
                });
            });

            collector.on('end', async () => {
                try {
                    await msg.edit({ components: [] });
                } catch {}
            });

        } catch (error) {
            console.error('Unsplash error:', error);
            await interaction.editReply('❌ Failed to fetch image from Unsplash. Please try again later.');
        }
    },
};
