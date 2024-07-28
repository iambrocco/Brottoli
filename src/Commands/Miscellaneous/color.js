const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const { EmbedBuilder } = require("discord.js");
const canvasImport = require("@napi-rs/canvas");
const { generateRGB, colorToHex } = require("../../Data/reusableFunctions.js");

module.exports = {
  data: new CommandBuilder()
    .setName("color")
    .setDescription("Get or Generate a Color")
    .addStringOption((option) =>
      option.setName("color").setDescription("The Color Code")
    )
    .setCategory("Miscellaneous")
    .setType(CommandTypes.SLASH),
  async execute(interaction, args) {
    await interaction.deferReply().then(async () => {
      let color = interaction.options.getString("color");
      let colorEmbed = new EmbedBuilder();
      let generatedColor = color ?? generateRGB().all;
      let colorImg = await generateCanvas(
        colorToHex(generatedColor, "", interaction)
      );
      async function generateCanvas(color) {
        let canvas = canvasImport.createCanvas(128, 128);
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const buffer = canvas.toBuffer("image/png");

        return buffer;
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
