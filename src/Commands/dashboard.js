// Import
const { SlashCommandBuilder } = require('@discordjs/builders');

// Creating the command
module.exports = {
    // Exporting the Data
	data: new SlashCommandBuilder()
		.setName('dashboard')
		.setDescription('Replies with a link to Brottoli\'s Dashboard!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};