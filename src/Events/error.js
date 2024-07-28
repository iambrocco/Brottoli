const fs = require("fs");
const path = require("path");
const { ensureDirectoryExistence } = require("../Data/reusableFunctions");
module.exports = {
  name: "error",
  /**
   *
   * @param {import("discord.js").DiscordjsError} error
   */
  async execute(client, error) {
    let logsPath = path.join(__dirname, "../../Logs/");
    ensureDirectoryExistence(logsPath);
    fs.writeFileSync(path.join(logsPath, `${Date.now()}.log`), JSON.stringify(error));
    console.log(`An Error Occured, it was written to ${Date.now()}.log`);
  },
};
