const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Sends a list of the commands available"),
  async execute(interaction) {
    var commandsEmbed = new MessageEmbed()
      .setTitle("Brottoli's Commands List")
      .setColor("RANDOM");

    var commandsArray = interaction.client.commands;
    commandsArray.forEach((command) => {
      commandsEmbed.addFields({
        name: `${command.data.name}`,
        value: `${command.data.description}`,
        inline: true,
      });
      command.data.options.forEach(sub =>{
        commandsEmbed.addFields({
          name: `${command.data.name} ${sub.name}`,
          value: `${sub.description}`,
          inline: true,
        });
        sub.options.forEach(option =>{
          commandsEmbed.addFields({
            name: `${command.data.name} ${sub.name} ${option.name}`,
            value: `${option.description}`,
            inline: true,
          });
        })
      })
      
    });
    
    await interaction.reply({ embeds: [commandsEmbed] });
  },
};