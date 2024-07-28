const joinLeaveStringValues = require("./joinLeaveStringValues.json");
const namedColors = require("color-name-list");

function processMessage(message) {
  let currentMsg = message;
  for (let key in joinLeaveStringValues.keys) {
    currentMsg = currentMsg.replace(
      new RegExp(joinLeaveStringValues.keys[key], "g"),
      eval(
        joinLeaveStringValues.values[0][joinLeaveStringValues.keys[key]].jsVal
      )
    );
  }
  return currentMsg;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function colorToHex(color, commandType, interaction) {
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
    try {
      let someNamedColor = namedColors.find(
        (colorParam) => colorParam.name.toLowerCase() == color
      );
      if (!someNamedColor) {
        return "#000000";
      }
      return someNamedColor.hex;
    } catch {
      return color.length == 6 && color.charAt(0) !== "#" ? `#${color}` : color;
    }
  }

  // RGBA format or RGB format
  if (color.startsWith("rgba") || color.startsWith("rgb")) {
    let rgba = color
      .slice(color.indexOf("(") + 1, color.indexOf(")"))
      .split(",");
    let r = parseInt(rgba[0].trim());
    let g = parseInt(rgba[1].trim());
    let b = parseInt(rgba[2].trim());
    return commandType == "gradient"
      ? "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
      : color;
  }

  // Unsupported format
  interaction
    ? interaction.followUp({
        ephemeral: true,
        content: `***If you've written a hex color code without the \`#\` it won't work.***`,
      })
    : "";
  return "#000000";
}

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
function generateRGB() {
  let r = Math.ceil(Math.random() * 255);
  let g = Math.ceil(Math.random() * 255);
  let b = Math.ceil(Math.random() * 255);
  return { r: r, g: g, b: b, all: `rgb(${r}, ${g}, ${b})` };
}
let reusable = {
  processMessage: processMessage,
  componentToHex: componentToHex,
  colorToHex: colorToHex,
  invertColor: invertColor,
  generateRGB: generateRGB,
  channelTypes: {
    0: "GuildText",
    1: "DM",
    2: "GuildVoice",
    3: "GroupDM",
    4: "GuildCategory",
    5: "GuildAnnouncement",
    10: "AnnouncementThread",
    11: "PublicThread",
    12: "PrivateThread",
    13: "GuildStageVoice",
    14: "GuildDirectory",
    15: "GuildForum",
  }
};

module.exports = reusable;
