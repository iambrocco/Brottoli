// Import
const { SlashCommandBuilder } = require("@discordjs/builders");
require("dotenv").config()
// Creating the command
module.exports = {
  // Exporting the Data
  data: new SlashCommandBuilder()
    .setName("supercell")
    .setDescription("Supercell game related commands")
    .addSubcommandGroup((group) =>
      group
        .setName("clash_of_clans")
        .setDescription("Clash Of Clans related commands")
        .addSubcommand(sub => sub.setName("user").setDescription("find a coc user"))
    )
    .addSubcommandGroup((group) =>
      group
        .setName("clash_royale")
        .setDescription("Clash Royale related commands")
        .addSubcommand(sub => sub.setName("user").setDescription("find a cr user"))
    )
    .addSubcommandGroup((group) =>
      group
        .setName("brawl_stars")
        .setDescription("Brawl Stars related commands")
        .addSubcommand(sub => sub.setName("user").setDescription("find a bs user"))
    ),
  async execute(interaction) {
    const e =  require('clash-of-clans-api');
   
    console.log(e);
    await interaction.reply("***Coming Soon:tm:***");
  },
};
