const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    ComponentType,
    MessageFlags,
} = require('discord.js');
const CommandBuilder = require('../../Structures/CommandBuilder.js');
const CommandTypes = require('../../Structures/Enums/CommandTypes.js');
const {filterText} = require("../../Data/reusableFunctions.js")
module.exports = {
    data: new CommandBuilder()
        .setName('urban')
        .setDescription('Fetches a definition from Urban Dictionary.')
        .setCategory('Utility')
        .setType(CommandTypes.SLASH)
        .addStringOption(opt =>
            opt.setName('term')
                .setDescription('The word or phrase to define')
                .setRequired(true)
        ),

    async execute(interaction) {
        const term = interaction.options.getString('term');
        await interaction.deferReply();

        try {
            const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const definitions = data.list?.filter(d => !!d.definition) || [];
            if (!definitions.length) {
                await interaction.editReply(`❌ No definitions found for **${term}**.`);
                return;
            }

            // Prepare embeds
            let index = 0;
            const total = definitions.length;

            const getEmbed = (defIndex) => {
                const def = definitions[defIndex];
                return new EmbedBuilder()
                    .setTitle(`📚 Urban Dictionary: ${def.word}`)
                    .setURL(def.permalink)
                    .setColor(Colors.Blue)
                    .setDescription(filterText(def.definition).text.slice(0, 4096))
                    .addFields(
                        { name: 'Example', value: filterText(def.example).text.slice(0, 1024) || 'None', inline: false },
                        { name: 'Author', value: def.author || 'Unknown', inline: true },
                        { name: '👍 / 👎', value: `${def.thumbs_up} / ${def.thumbs_down}`, inline: true },
                        { name: 'Entry', value: `${defIndex + 1}/${total}`, inline: true },
                    )
                    .setFooter({ text: `Requested by ${interaction.user.username}` })
                    .setTimestamp();
            };

            // Create buttons for pagination
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

            // Send initial embed
            const msg = await interaction.editReply({
                embeds: [getEmbed(index)],
                components: [getButtons(index)],
            });

            // Collector for button interactions
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000, // 1 minute
            });

            collector.on('collect', async (btnInt) => {
                if (btnInt.user.id !== interaction.user.id)
                    return btnInt.reply({ content: '❌ Only the command user can use these buttons.', flags: MessageFlags.Ephemeral });

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
        } catch (err) {
            console.error('Urban Dictionary fetch error:', err);
            await interaction.editReply('❌ Failed to fetch definitions. Try again later.');
        }
    },
};
