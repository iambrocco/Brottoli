const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
const { EmbedBuilder } = require("discord.js");
const canvasImport = require("@napi-rs/canvas");
const namedColors = require("color-name-list");

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
    await interaction.deferReply();
    function colorToHex(color) {
      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      // Remove whitespace and convert to lowercase
      color = color.trim().toLowerCase();

      // Hex shorthand (e.g., #fff)
      if (color.charAt(0) === "#") {
        // Expand shorthand
        if (color.length === 4) {
          color =
            "#" +
            color.charAt(1) +
            color.charAt(1) +
            color.charAt(2) +
            color.charAt(2) +
            color.charAt(3) +
            color.charAt(3);
        }
        return color;
      }

      if (
        RegExp(`[g-z]`).test(color) &&
        !color.startsWith("rgba") &&
        !color.startsWith("rgb")
      ) {
        let someNamedColor = namedColors.find(
          (colorParam) => colorParam.name.toLowerCase() == color
        );
        if (!someNamedColor) {
          return "#000000";
        }
        return someNamedColor.hex;
      }

      // RGBA format or RGB format
      if (color.startsWith("rgba") || color.startsWith("rgb")) {
        let rgba = color
          .slice(color.indexOf("(") + 1, color.indexOf(")"))
          .split(",");
        let r = parseInt(rgba[0].trim());
        let g = parseInt(rgba[1].trim());
        let b = parseInt(rgba[2].trim());
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      // Unsupported format
      return null;
    }
    let color = interaction.options.getString("color");
    let colorEmbed = new EmbedBuilder();
    let generatedColor = color ?? generateRGB();
    let colorImg = await generateCanvas(colorToHex(generatedColor));
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
  },
};
