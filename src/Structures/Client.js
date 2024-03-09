const discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const namedColors = require("color-name-list");
class Client extends discord.Client {
  /**
   *
   * @param {import("discord.js").ClientOptions} options
   */
  constructor(options) {
    super(options);
    this.Commands = new Map();
    this.CommandCategories = new Map();
    this.textCommandsPrefix = "!";
  }
  colorToHex(color, commandType) {
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    // Remove whitespace and convert to lowercase
    color = color.trim().toLowerCase();
    if (
      RegExp("[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3}", "g").test(color) &&
      color.charAt(0) !== "#"
    ) {
      return `#${color}`;
    }
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
      return commandType == "gradient"
        ? "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
        : color;
    }

    // Unsupported format
    return null;
  }

  invertColor(hexColor) {
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
  loadFunctionFiles(type) {
    let types = {
      cmd: {
        folderPath: "./Commands",
        executeFN: (commandFile) => {
          this.Commands.set(commandFile.data.name, commandFile);
        },
      },
      ev: {
        folderPath: "./Events",
        executeFN: (commandFile) => {
          if (commandFile.once) {
            this.once(commandFile.name, (...args) =>
              commandFile.execute(...args)
            );
          } else {
            this.on(commandFile.name, (...args) =>
              commandFile.execute(...args)
            );
          }
        },
      },
    };
    let loadSubFiles = (subFolderPath) => {
      const isDirectory = fs.lstatSync(subFolderPath).isDirectory();
      if (isDirectory) {
        const children = fs.readdirSync(subFolderPath);
        for (const child of children) {
          const subPath = path.join(subFolderPath, child);
          loadSubFiles(subPath);
        }
      } else {
        const commandFile = require(subFolderPath);
        types[type].executeFN(commandFile);
      }
    };

    const CommandsFolderPath = path.join(
      __dirname,
      `../${types[type].folderPath}`
    );
    const CommandSubFolders = fs.readdirSync(CommandsFolderPath);

    for (const dir of CommandSubFolders) {
      const filePath = path.join(CommandsFolderPath, dir);

      loadSubFiles(filePath);
    }
    return this;
  }
  async refreshCommands(token) {
    const commands = [];
    this.Commands.forEach((command) => {
      commands.push(command.data.toJSON());
    });
    const rest = new discord.REST().setToken(token);

    (async () => {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );
      await rest
        .put(discord.Routes.applicationCommands(process.env.clientId), {
          body: commands,
        })
        .then((e) => {
          console.log(
            `Successfully reloaded ${e.length} application (/) commands.`
          );
        })
        .catch((error) => {
          console.log("An Error Occured:", error);
          this.refreshCommands(token);
        });
    })();
  }
  setCommandCategories() {
    let groupedCommands = {};
    this.Commands.forEach((command) => {
      const category = command.data.category;
      if (groupedCommands[category]) {
        groupedCommands[category].push(command);
      } else {
        groupedCommands[category] = [command];
      }
    });

    const sortedCategories = Object.keys(groupedCommands).sort();

    for (const category of sortedCategories) {
      const commands = groupedCommands[category].sort((a, b) =>
        a.data.name.localeCompare(b.data.name)
      );

      this.CommandCategories.set(category, commands);
    }
  }
  start(token) {
    console.clear();
    this.loadFunctionFiles("ev");
    this.loadFunctionFiles("cmd");
    this.refreshCommands(token);
    this.setCommandCategories();
    this.login(token);
  }
}
module.exports = Client;
