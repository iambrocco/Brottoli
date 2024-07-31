const fs = require("fs");
const path = require("path");
const {
  ensureDirectoryExistence,
  errorLogger,
} = require("../Data/reusableFunctions");
module.exports = {
  name: "error",
  /**
   *
   * @param {import("discord.js").DiscordjsError} error
   */
  async execute(client, error) {
    errorLogger(error);
  },
};
