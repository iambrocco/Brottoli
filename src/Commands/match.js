const { SlashCommandBuilder } = require("@discordjs/builders");
const { Modal, MessageActionRow, TextInputComponent } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Matches you with other users with similar traits")
    .addSubcommandGroup((group) =>
      group
        .setName("setup")
        .setDescription("Base setup Command")
        .addSubcommand((sub1) =>
          sub1.setName("run").setDescription("Setup your matching traits")
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("use")
        .setDescription("Matches you with other users with similar traits")
        .addSubcommand(sub2 =>
          sub2.setName("start").setDescription("start matching")
        )
    
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommandGroup() === "setup") {
      if (interaction.options.getSubcommand() === "run") {
        var gamesInput = new TextInputComponent()
          .setCustomId("matchSetupGames")
          .setStyle("PARAGRAPH")
          .setLabel("Input the game(s) you play here")
          .setPlaceholder(
            'INPUT AS "GAME, GAME, "\n/match setup help for reference'
          )
          .setRequired(true);
        var hobbiesInput = new TextInputComponent()
          .setCustomId("matchSetupHobbies")
          .setStyle("PARAGRAPH")
          .setLabel("Input your hobby(ies) here")
          .setPlaceholder(
            'INPUT AS "HOBBY, HOBBY, "\n/match setup help for reference'
          )
          .setRequired(true);
        var FavGenreInput = new TextInputComponent()
          .setCustomId("matchSetupFavGenre")
          .setStyle("PARAGRAPH")
          .setLabel("Input your favorite genre(s) here")
          .setPlaceholder(
            'INPUT AS "GENRE, GENRE, "\n/match setup help for reference'
          )
          .setRequired(true);
        var st = new MessageActionRow().setComponents(gamesInput);
        var nd = new MessageActionRow().setComponents(hobbiesInput);
        var rd = new MessageActionRow().setComponents(FavGenreInput);
        var MatchSetUpModal = new Modal()
          .setTitle("Fill in your traits to match with others")
          .setCustomId("matchSetup")
          .addComponents(st, nd, rd);
        await interaction.showModal(MatchSetUpModal);
      }
    }
   
      if (interaction.options.getSubcommandGroup() === "use") {
        if(interaction.options.getSubcommand() == "start"){
          await interaction.reply("bozo");
        }
      }
    
  },
};
