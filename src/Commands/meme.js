// Import
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const rm = require("random-memes");
// Creating the command
module.exports = {
  // Exporting the Data
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Replies with a meme!")
    .addSubcommand((sub) =>
      sub.setName("random").setDescription("Sends a random meme")
    )
    .addSubcommand((sub) =>
      sub
        .setName("reddit")
        .setDescription("Sends a reddit meme")
        
    ),
  async execute(interaction) {
    if(interaction.options.getSubcommand() == "random"){
        var meme = rm.random();
        var embd = new MessageEmbed()
        await meme.then( (e) =>{
            embd.setTitle(`${e.caption}`)
            embd.setImage(e.image)
        })
        await interaction.reply({embeds: [embd]});
    }
    if(interaction.options.getSubcommand() == "reddit"){
        var meme = rm.fromReddit("en");
        var embd = new MessageEmbed()
        await meme.then( (e) =>{
            embd.setTitle(`${e.caption}`)
            embd.setDescription(`** **`)
            embd.setImage(e.image)
        })
        await interaction.reply({embeds: [embd]});
    }
  },
};
