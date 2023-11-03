const { SlashCommandBuilder } = require("discord.js");

class CommandBuilder extends SlashCommandBuilder{
  constructor() {
    super()
    this.commandType = "SLASH";
    this.category = "Uncategorized";
    this.commandRank = "FREE";
    
  }
  /**
   *
   * @param {"TEXT" | "SLASH" | "BOTH"} type
   */
  setType(type) {
    this.commandType = type;
    return this;
  }
  /**
   *
   * @param {"PREMIUM" | "FREE" | "FREEMIUM"} type
   */
  setCommandRank(type) {
    this.commandRank = type;
    return this;
  }
  /**
   *
   * @param {String} category
   */
  setCategory(category) {
    this.category = category;
    return this;
  }
  
}
module.exports = CommandBuilder;