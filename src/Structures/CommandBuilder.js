const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require("discord.js");
const CommandTypes = require("./Enums/CommandTypes.js");
class CommandBuilder extends SlashCommandBuilder {
  constructor() {
    super();
    this.commandType = CommandTypes.SLASH;
    this.category = "Uncategorized";
    this.contexts = [InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM];
    this.integration_types = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
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
   * @param {InteractionContextType} contexts 
   * @returns 
   */
  setContexts(contexts) {
    this.contexts = contexts;
    return this;
  }

  /**
   * 
   * @param  {RestOrArray<ApplicationIntegrationType>} integration_types 
   * @returns 
   */
  setIntegrationTypes(...integration_types) {
    this.integration_types = integration_types;
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
