const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
module.exports = {
  data: new CommandBuilder()
    .setName("config")
    .setDescription("Configuration Command")
    .setType(CommandTypes.SLASH)
    .addSubcommand((command) =>
      command
        .setName("join_leave")
        .setDescription(`Setup The Automated Join/Leave messages`)
    )
    .setCategory("Moderation"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    interaction.client.db.query(`UPDATE guilds SET customConfig = 1`);
    if (interaction.options.getSubcommand() == "join_leave") {
      await interaction.reply({
        ephemeral: true,
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setValue(`1`)
                  .setLabel("Enabled")
                  .setDescription(`Enable Join/Leave Messages In This Server`),
                new StringSelectMenuOptionBuilder()
                  .setValue(`0`)
                  .setLabel("Disabled")
                  .setDescription(`Disable Join/Leave Messages In This Server`)
              )
              .setCustomId(`enablejl`)
              .setPlaceholder("Do You Want Join/Leave Messages?")
          ),
        ],
      });
    }
  },
};
