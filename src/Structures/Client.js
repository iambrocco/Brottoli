const discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const mysql2 = require("mysql2");

class Client extends discord.Client {
  /**
   *
   * @param {import("discord.js").ClientOptions} options
   */
  constructor(options) {
    super(options);
    this.Commands = new Map();
    this.CommandCategories = new Map();
    this.db = mysql2.createConnection({
      host: process.env.dbhost,
      user: process.env.dbuser,
      database: process.env.dbname,
      password: process.env.dbpass,
    });
    this.textCommandsPrefix = "!";
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
              commandFile.execute(this, ...args)
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
      this.log(
        `Started refreshing ${commands.length} application (/) commands.`, "debug"
      );
      await rest
        .put(discord.Routes.applicationCommands(process.env.clientId), {
          body: commands,
        })
        .then((e) => {
          this.log(
            `Successfully reloaded ${e.length} application (/) commands.`, "debug"
          );
        })
        .catch((error) => {
          this.log("An Error Occured: " + error, "error");
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
    this.db.on("error", (err) => {
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      this.log("Database connection lost. Attempting to reconnect...", "warn");
      this.db = mysql2.createConnection({
        host: process.env.dbhost,
        user: process.env.dbuser,
        database: process.env.dbname,
        password: process.env.dbpass,
      });
      this.db.connect((error) => {
        if (error) {
        this.log("Failed to reconnect to the database: " + error.message, "error");
        } else {
        this.log("Successfully reconnected to the database.", "info");
        }
      });
      } else {
      this.log(err, "error");
      }
    });
    this.clientStart = Date.now();
    fs.existsSync(path.join(__dirname, "../../Logs")) ||
      fs.mkdirSync(path.join(__dirname, "../../Logs"), { recursive: true });
    this.instanceLogFilePath = path.join(__dirname, `../../Logs/${new Date(this.clientStart).toISOString().replace("T", "-").replaceAll(":", "-").slice(0, 19)}.log`)
    fs.writeFileSync(
      this.instanceLogFilePath,
      `[INFO - ${new Date(this.clientStart).toISOString().replace("T", " ").slice(0, 19)}] Client Started.`
    );
    console.clear();
    this.loadFunctionFiles("ev");
    this.loadFunctionFiles("cmd");
    this.refreshCommands(token);
    this.setCommandCategories();
    this.login(token);
    this.db.on("error", (err) => {
      this.log(err, "error");

    })
  }
  isDatabaseConnected() {
    return this.db.authorized === true;
  }
  log(message, level = "debug") {
    const levels = {
      error: '\x1b[31m', // red
      debug: '\x1b[36m', // cyan
      info: '\x1b[34m', // blue
      warn: '\x1b[33m', // yellow
      green: '\x1b[32m',
      reset: '\x1b[0m',
      magenta: '\x1b[35m',
      white: '\x1b[37m',
    };
    const date = new Date();
    const formattedDate = date.toISOString().replace("T", " ").slice(0, 19);
    const callerFile = (new Error().stack.split("\n")[2].match(/\((.*):\d+:\d+\)/) || [])[1] || "Client.js";
    const errorDetails = level == "error" ? `\nStack Trace:\n${message.stack}` : '';

    fs.writeFileSync(
      this.instanceLogFilePath,
      `${fs.readFileSync(this.instanceLogFilePath).toString()}\n[${level.toUpperCase()} - ${formattedDate}] ${message}${errorDetails}`
    );
    console.log(`${levels["reset"]}[${levels[level]}${level.toUpperCase()}${levels["reset"]} - ${formattedDate} - ${callerFile.split("\\")[callerFile.split("\\").length - 1]}] ${levels[level]}${message}${levels["reset"]}`);
  }
}
module.exports = Client;
