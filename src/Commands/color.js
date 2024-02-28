const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
const { EmbedBuilder } = require("discord.js");
const canvasImport = require("@napi-rs/canvas");


module.exports = {
  data: new CommandBuilder()
    .setName("color")
    .setDescription("Get or generate a color")
    .addStringOption((option) =>
      option.setName("color").setDescription("the color code")
    )
    .setCategory("Miscellaneous")
    .setType(CommandTypes.SLASH),
  async execute(interaction, args) {
    await interaction.deferReply().then(async () => {
      
      let color = interaction.options.getString("color");
      let colorEmbed = new EmbedBuilder();
      let generatedColor = color ?? generateRGB();
      let colorImg = await generateCanvas(interaction.client.colorToHex(generatedColor));
      async function generateCanvas(color) {
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
    });
  },
};
