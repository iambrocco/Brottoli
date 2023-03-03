// Import
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

// Creating the command
module.exports = {
  // Exporting the Data
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Replies with lyrics!")
    .addStringOption((opt) =>
      opt
        .setName("author")
        .setDescription("The Name of the song author/artist")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("song")
        .setDescription("The Name of the song")
        .setRequired(true)
    ),
  async execute(interaction) {
    const lyricsFinder = require("lyrics-finder");
    var Filter = require("bad-words"),
      filter = new Filter();
    async function test(artist, title) {
      let lyrics = (await lyricsFinder(artist, title)) || "Not Found!";
      var embedsArray = [];
      var lyricsSplit = lyrics.split("\n\n");
      var one;
      lyricsSplit.forEach((lyricsPart, i) => {
        if (i <= 24) {
          one = new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(`lyrics of ${title} by ${artist}`)

            .addFields({ name: "** **", value: `${lyricsPart}` });
        }
      });
      embedsArray.push(one);
      console.log(lyrics);
    }
    test(
      interaction.options.getString("author"),
      interaction.options.getString("song")
    );
    await interaction.reply({ embeds: embedsArray });
  },
};
