const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Sends a list of the commands available")
    .addStringOption(opt => opt.setName("command").setDescription("Type the name of the command you want help in")),
  async execute(interaction) {
    var commandsEmbed = new MessageEmbed()
      .setTitle("Brottoli's Commands List")
      .setColor("RANDOM");

    var commandsArray = interaction.client.commands;
    for (const command of commandsArray) {
      if(interaction.options.getString("command") == command[0]){
        commandsEmbed.setTitle("yo")
      }
      if(interaction.options.getString("command") != command[1].data.name){
        
        commandsEmbed.addFields({
          name: `${command[1].data.name}`,
          value: `${command[1].data.description}`,
          inline: true,
        });
      }
    }

    
    await interaction.reply({ embeds: [commandsEmbed] });
  },
};