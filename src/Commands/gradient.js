const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
const javascriptColorGradient = require("javascript-color-gradient");
const canvasImport = require("@napi-rs/canvas");
const { EmbedBuilder } = require("@discordjs/builders");
module.exports = {
  data: new CommandBuilder()
    .setName("gradient")
    .setDescription("Generate a color gradient")
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription("The color to begin the gradient with")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("finish")
        .setDescription("The color to end the gradient with")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("count")
        .setDescription("How many colors should the generated gradient have?")
        .setRequired(true)
    )
    .setType(CommandTypes.SLASH)
    .setCategory("Miscellaneous"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    function invertColor(hexColor) {
      // Remove # if it's there
      hexColor = hexColor.replace("#", "");

      // Convert hex to RGB
      var r = parseInt(hexColor.substr(0, 2), 16);
      var g = parseInt(hexColor.substr(2, 2), 16);
      var b = parseInt(hexColor.substr(4, 2), 16);

      // Invert RGB values
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;

      // Convert back to hex
      var invertedHex =
        "#" +
        ("0" + r.toString(16)).slice(-2) +
        ("0" + g.toString(16)).slice(-2) +
        ("0" + b.toString(16)).slice(-2);

      return invertedHex;
    }
    await interaction.deferReply();
    const canvas = canvasImport.createCanvas(512, 512);
    const ctx = canvas.getContext("2d");
    let startColor = interaction.options.getString("start");
    let finishColor = interaction.options.getString("finish");
    let midPoints = interaction.options.getNumber("count");
    function generateGradientCanvas(startColor, finishColor, midPoints) {
      let gradient = new javascriptColorGradient()
        .setColorGradient(startColor, finishColor)
        .setMidpoint(midPoints)
        .getColors();
      let canvasSectionheight = canvas.height / gradient.length;
      let colorsString = "";
      for (color in gradient) {
        ctx.fillStyle = gradient[color];
        ctx.fillRect(
          0,
          color * canvasSectionheight - 3,
          canvas.width,
          canvasSectionheight
        );
        ctx.fillStyle = invertColor(gradient[color]);
        ctx.fillText(
          gradient[color],
          canvas.width / 2.25,
          color * canvasSectionheight
        );
      }
      return { canvas: canvas, gradient: gradient, colorsString: colorsString };
    }
    let generatedCanvasWithGradient = generateGradientCanvas(
      startColor,
      finishColor,
      midPoints
    );
    let gradientEmbed = new EmbedBuilder()
      .setTitle("Gradient Canvas")
      .setDescription(
        `A Canvas of Gradient of start ${
          generatedCanvasWithGradient.gradient[0]
        } and end ${generatedCanvasWithGradient.gradient.pop()}`
      )
      .setImage("attachment://image.png")
      .addFields({
        name: "Gradient Info",
        value: `Gradient Start: ${
          generatedCanvasWithGradient.gradient[0]
        }\nGradient Finish: ${generatedCanvasWithGradient.gradient.pop()}\nGradient Points Count: ${midPoints}`,
      });
    await interaction.editReply({
      embeds: [gradientEmbed],
      files: [
        {
          name: "image.png",
          attachment: generatedCanvasWithGradient.canvas.toBuffer("image/png"),
        },
      ],
    });
  },
};
