const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
const javascriptColorGradient = require("javascript-color-gradient");
const canvasImport = require("@napi-rs/canvas");
const { EmbedBuilder } = require("@discordjs/builders");
module.exports = {
  data: new CommandBuilder()
    .setName("gradient")
    .setDescription("Generate a Color Gradient")
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription("The Color to Begin the Gradient With")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("finish")
        .setDescription("The Color to End the Gradient With")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("count")
        .setDescription("How Many Colors Should the Generated Gradient Have?")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("colortext")
        .setDescription(
          "Write The Color Hex Value on the color? (default true)"
        )
    )
    .setType(CommandTypes.SLASH)
    .setCategory("Miscellaneous"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply().then(async () => {
      const canvas = canvasImport.createCanvas(512, 512);
      const ctx = canvas.getContext("2d");
      let startColor = interaction.options.getString("start");
      let finishColor = interaction.options.getString("finish");
      let midPoints = interaction.options.getNumber("count");
      let colorText = interaction.options.getBoolean("colortext") ?? true;
      function generateGradientCanvas(startColor, finishColor, midPoints) {
        let gradient = new javascriptColorGradient()
          .setColorGradient(
            interaction.client.colorToHex(startColor, "gradient"),
            interaction.client.colorToHex(finishColor, "gradient")
          )
          .setMidpoint(midPoints)
          .getColors();
        gradient.unshift(interaction.client.colorToHex(startColor, "gradient", interaction));
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
          if (colorText) {
            ctx.fillStyle = interaction.client.invertColor(gradient[color]);
            ctx.fillText(
              gradient[color],
              canvas.width / 2.25,
              color * canvasSectionheight
            );
          }
        }
        return {
          canvas: canvas,
          gradient: gradient,
          colorsString: colorsString,
        };
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
          } and end ${
            generatedCanvasWithGradient.gradient[
              generatedCanvasWithGradient.gradient.length - 1
            ]
          }`
        )
        .setImage("attachment://image.png")
        .addFields({
          name: "Gradient Info",
          value: `Gradient Start: ${
            generatedCanvasWithGradient.gradient[0]
          }\nGradient Finish: ${
            generatedCanvasWithGradient.gradient[
              generatedCanvasWithGradient.gradient.length - 1
            ]
          }\nGradient Points Count: ${midPoints}`,
        });
      await interaction.editReply({
        embeds: [gradientEmbed],
        files: [
          {
            name: "image.png",
            attachment:
              generatedCanvasWithGradient.canvas.toBuffer("image/png"),
          },
        ],
      });
    });
  },
};
