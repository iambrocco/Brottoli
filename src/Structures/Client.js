const discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const mysql2 = require("mysql2");

class Client extends discord.Client {
  /**
   * @param {import("discord.js").ClientOptions} options
   */
  constructor(options) {
    super(options);
    this.Commands = new Map();
    this.CommandCategories = new Map();
    this.textCommandsPrefix = "!";
    this.db = null;
    this.isReconnecting = false;
  }

  // ✅ Auto-reconnecting MySQL pool
  connectToDatabase(retryCount = 0) {
    const maxDelay = 30000;
    const baseDelay = 2000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

    this.log(`Connecting to database (attempt ${retryCount + 1})...`, "info");

    try {
      const pool = mysql2.createPool({
        host: process.env.dbhost,
        user: process.env.dbuser,
        database: process.env.dbname,
        password: process.env.dbpass,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      pool.getConnection((err, connection) => {
        if (err) {
          this.log(`Database connection failed: ${err.message}`, "warn");
          setTimeout(() => this.connectToDatabase(retryCount + 1), delay);
          return;
        }

        this.db = pool;
        this.isReconnecting = false;
        this.log("✅ Database pool connected successfully!", "info");
        connection.release();

        pool.on("error", (error) => {
          this.log(`Database pool error: ${error.message}`, "error");
          if (
            error.code === "PROTOCOL_CONNECTION_LOST" ||
            error.code === "ECONNRESET" ||
            error.code === "ETIMEDOUT" ||
            error.code === "EPIPE" ||
            error.fatal
          ) {
            if (!this.isReconnecting) {
              this.isReconnecting = true;
              this.log("Attempting to reconnect to the database...", "warn");
              setTimeout(() => this.connectToDatabase(0), 2000);
            }
          } else {
            this.log(`Unhandled DB error: ${error.message}`, "error");
          }
        });
      });
    } catch (error) {
      this.log(`Unexpected DB error: ${error.message}`, "error");
      setTimeout(() => this.connectToDatabase(retryCount + 1), delay);
    }
  }

  /**
 * 🔹 Safe DB query supporting both callbacks and Promises.
 * Automatically retries if disconnected.
 * @param {string} sql - The SQL query
 * @param {Array|function} [params=[]] - Query parameters or callback
 * @param {function} [callback] - Optional callback
 * @param {number} [retryCount=0] - Retry count (internal)
 * @returns {Promise<any>|void}
 */
  query(sql, params = [], callback, retryCount = 0) {
    const maxRetries = 5;
    const delay = 2000;

    // Handle optional params/callback
    if (typeof params === "function") {
      callback = params;
      params = [];
    }

    const execQuery = async (resolve, reject) => {
      if (!this.db) {
        if (retryCount >= maxRetries) {
          const err = new Error("Database not connected — aborting query.");
          this.log(err.message, "error");
          if (callback) return callback(err, null);
          return reject(err);
        }

        this.log("Database not ready. Retrying query...", "warn");
        setTimeout(
          () => this.query(sql, params, callback, retryCount + 1).then(resolve).catch(reject),
          delay
        );
        return;
      }

      this.db.query(sql, params, async (err, results) => {
        if (
          err &&
          ["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "ETIMEDOUT"].includes(err.code) &&
          retryCount < maxRetries
        ) {
          this.log(
            `Query failed due to connection issue. Retrying... (${retryCount + 1})`,
            "warn"
          );
          setTimeout(
            () => this.query(sql, params, callback, retryCount + 1).then(resolve).catch(reject),
            delay
          );
          return;
        }

        if (err) {
          this.log(
            `Query failed: ${err.message}\nSQL: ${sql}\nParams: ${JSON.stringify(params)}`,
            "error"
          );
          if (callback) return callback(err, null);
          return reject(err);
        }

        if (callback) return callback(null, results);
        resolve(results);
      });
    };

    // If a callback is provided → do not return a Promise
    if (callback) {
      execQuery(() => { }, () => { });
      return;
    }

    // Otherwise return a Promise
    return new Promise(execQuery);
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
        executeFN: (eventFile) => {
          if (eventFile.once) {
            this.once(eventFile.name, (...args) =>
              eventFile.execute(...args)
            );
          } else {
            this.on(eventFile.name, (...args) =>
              eventFile.execute(this, ...args)
            );
          }
        },
      },
    };

    const loadSubFiles = (subFolderPath) => {
      const isDirectory = fs.lstatSync(subFolderPath).isDirectory();
      if (isDirectory) {
        for (const child of fs.readdirSync(subFolderPath)) {
          loadSubFiles(path.join(subFolderPath, child));
        }
      } else {
        const file = require(subFolderPath);
        types[type].executeFN(file);
      }
    };

    const folderPath = path.join(__dirname, `../${types[type].folderPath}`);
    for (const dir of fs.readdirSync(folderPath)) {
      loadSubFiles(path.join(folderPath, dir));
    }

    return this;
  }

  async refreshCommands(token) {
    const commands = Array.from(this.Commands.values()).map((cmd) =>
      cmd.data.toJSON()
    );
    const rest = new discord.REST().setToken(token);

    try {
      this.log(
        `Started refreshing ${commands.length} application (/) commands.`,
        "debug"
      );

      const data = await rest.put(
        discord.Routes.applicationCommands(process.env.clientId),
        { body: commands }
      );

      this.log(
        `Successfully reloaded ${data.length} application (/) commands.`,
        "debug"
      );
    } catch (error) {
      this.log("Error refreshing commands: " + error.message, "error");
      setTimeout(() => this.refreshCommands(token), 10000);
    }
  }

  setCommandCategories() {
    const grouped = {};

    this.Commands.forEach((command) => {
      const category = command.data.category || "Misc";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(command);
    });

    Object.keys(grouped)
      .sort()
      .forEach((category) => {
        const commands = grouped[category].sort((a, b) =>
          a.data.name.localeCompare(b.data.name)
        );
        this.CommandCategories.set(category, commands);
      });
  }

  start(token) {
    this.clientStart = Date.now();

    const logsDir = path.join(__dirname, "../../Logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    this.instanceLogFilePath = path.join(
      logsDir,
      `${new Date(this.clientStart)
        .toISOString()
        .replace("T", "-")
        .replaceAll(":", "-")
        .slice(0, 19)}.log`
    );

    fs.writeFileSync(
      this.instanceLogFilePath,
      `[INFO - ${new Date(this.clientStart)
        .toISOString()
        .replace("T", " ")
        .slice(0, 19)}] Client Started.`
    );

    console.clear();
    this.loadFunctionFiles("ev");
    this.loadFunctionFiles("cmd");
    this.setCommandCategories();
    this.connectToDatabase(); // 🔹 Resilient DB connection
    this.refreshCommands(token);
    this.login(token);
  }

  isDatabaseConnected() {
    if (!this.db) return false;
    try {
      return this.db._closed === false;
    } catch {
      return false;
    }
  }

  log(message, level = "debug") {
    const levels = {
      error: "\x1b[31m",
      debug: "\x1b[36m",
      info: "\x1b[34m",
      warn: "\x1b[33m",
      green: "\x1b[32m",
      reset: "\x1b[0m",
      magenta: "\x1b[35m",
      white: "\x1b[37m",
    };

    const date = new Date();
    const formattedDate = date.toISOString().replace("T", " ").slice(0, 19);
    const callerFile =
      (new Error().stack.split("\n")[2].match(/\((.*):\d+:\d+\)/) || [])[1] ||
      "Client.js";
    const errorDetails =
      level === "error" && message.stack ? `\nStack Trace:\n${message.stack}` : "";

    fs.writeFileSync(
      this.instanceLogFilePath,
      `${fs.readFileSync(this.instanceLogFilePath)}\n[${level.toUpperCase()} - ${formattedDate}] ${message}${errorDetails}`
    );

    console.log(
      `${levels.reset}[${levels[level]}${level.toUpperCase()}${levels.reset} - ${formattedDate} - ${path.basename(
        callerFile
      )}] ${levels[level]}${message}${levels.reset}`
    );
  }
}

module.exports = Client;
