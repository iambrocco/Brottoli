// Import
const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the command
module.exports = {
    // Exporting the Data
	data: new SlashCommandBuilder()
		.setName('moderation')
		.setDescription('moderation commands'),
	async execute(interaction) {
		await interaction.reply('W.I.P!');
	},
};