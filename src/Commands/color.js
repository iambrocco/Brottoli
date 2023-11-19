const CommandBuilder = require("../Structures/CommandBuilder");
const { EmbedBuilder } = require("discord.js");
module.exports = {
  data: new CommandBuilder()
    .setName("color")
    .setDescription("Get or generate a color")
    .addStringOption((option) =>
      option.setName("color").setDescription("the color code")
    )
    .setCategory("Miscellaneous")
    .setType("slash"),
  async execute(interaction, args) {
    let color = interaction.options.getString("color");
    let colorEmbed = new EmbedBuilder();
    let generatedColor = color ?? generateRGB();
    let colorImg = await generateCanvas(generatedColor);
    async function generateCanvas(color) {
      const canvasImport = require("canvas");
      let canvas = canvasImport.createCanvas(128, 128);
      let ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const buffer = canvas.toBuffer("image/png");

      return buffer;
    }
    function generateRGB() {
      let r = Math.ceil(Math.random() * 255);
      let g = Math.ceil(Math.random() * 255);
      let b = Math.ceil(Math.random() * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }
    interaction.deferReply();
    await interaction.editReply({
      embeds: [
        colorEmbed
          .setThumbnail("attachment://color.png")
          .setTitle(`${generatedColor} color`),
      ],
      files: [
        {
          attachment: colorImg,
          name: "color.png",
        },
      ],
    });
  },
};
