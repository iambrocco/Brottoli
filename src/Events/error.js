const fs = require("fs");
const path = require("path");
module.exports = {
  name: "error",
  /**
   *
   * @param {import("discord.js").ErrorEvent} error
   */
  async execute(client, error) {
    fs.writeFileSync(
      path.join(__dirname, "../../Logs/", `${Date.now()}.log`),
      error
    );
    console.log(`An Error Occured, it was written to ${Date.now()}.log`);
  },
};
