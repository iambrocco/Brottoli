const { EmbedBuilder, Colors, inlineCode, MessageFlags } = require('discord.js');
const CommandBuilder = require('../../Structures/CommandBuilder.js');
const CommandTypes = require('../../Structures/Enums/CommandTypes.js');

module.exports = {
    data: new CommandBuilder()
        .setName("translate")
        .setDescription("Translates text from one language to another.")
        .setCategory("Utility")
        .setType(CommandTypes.SLASH)
        .addStringOption(option =>
            option.setName("text")
                .setDescription("The text to translate")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("source_language")
                .setDescription("Language to translate from (e.g., 'en', 'es')")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("target_language")
                .setDescription("Language to translate into (e.g., 'en', 'es')")
                .setRequired(true)
        ),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const sourceLanguage = interaction.options.getString("source_language");
        const targetLanguage = interaction.options.getString("target_language");

        // Defer ephemeral reply first
        await interaction.deferReply();

        try {
            async function translateText(text, sourceLang, targetLang) {
                const res = await fetch(
                    `https://655.mtis.workers.dev/translate?text=${encodeURIComponent(text)}&source_lang=${sourceLang}&target_lang=${targetLang}`
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            }

            const translated = await translateText(text, sourceLanguage, targetLanguage);

            // Safely extract translation text
            let translatedStr =
                typeof translated === "string"
                    ? translated
                    : translated?.response?.translated_text
                    ?? translated?.translated_text
                    ?? JSON.stringify(translated);

            // Ephemeral (private) detailed embed
            const privateEmbed = new EmbedBuilder()
                .setTitle("🌐 Translation (Private)")
                .addFields(
                    { name: "Original", value: text.slice(0, 1024), inline: false },
                    { name: "Translated", value: String(translatedStr).slice(0, 1024), inline: false },
                    { name: "Languages", value: `${sourceLanguage} → ${targetLanguage}`, inline: true },
                )
                .setColor(Colors.Green)
                .setTimestamp();

            // Public (visible) summary embed
            const publicEmbed = new EmbedBuilder()
                .setTitle("🌐 Translation Completed")
                .addFields(
                    { name: "Original Content", value: String(text).slice(0, 1024), inline: false },
                )
                .setColor(Colors.Blue)
                .setTimestamp();

            // Follow up publicly
            await interaction.editReply({
                content: inlineCode(translatedStr),
                embeds: [publicEmbed],
            });
                        // Edit the ephemeral deferred reply
            await interaction.followUp({
                content: "✅ Translation completed (only you can see this).\n" + inlineCode("Translations are not 100% Accurate"),
                embeds: [privateEmbed],
                flags: MessageFlags.Ephemeral,
            });


        } catch (error) {
            console.error("Translation error:", error);
            await interaction.editReply({
                content: "❌ Sorry, there was an error translating the text. Please try again later.",
            });
        }
    }
};
