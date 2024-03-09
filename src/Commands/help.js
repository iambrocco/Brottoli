const {
  EmbedBuilder,
  Colors,
  codeBlock,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  inlineCode,
} = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
module.exports = {
  data: new CommandBuilder()
    .setName("help")
    .setDescription("Use This Command To Get Help With Other Commands")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Get a list of Commands For This Category")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The Command You Want Help With")
        .setRequired(false)
    )
    .setCategory("Utility")
    .setType(CommandTypes.BOTH),
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {String[]} args
   * @returns
   */
  async execute(interaction, args) {
    let commandName = interaction.content
      ? args[1]
        ? args[1].toLowerCase()
        : null
      : interaction.options.getString("command")
      ? interaction.options.getString("command").toLowerCase()
      : interaction.options.getString("command");

    if (!commandName) {
      // Get the first entry from CommandCategories
      let category =
        interaction.options.getString("category") ??
        interaction.client.CommandCategories.keys().next().value;
      category = category.replace(
        category.charAt(0),
        category.charAt(0).toUpperCase()
      );
      let commands = interaction.client.CommandCategories.get(category);
      const helpEmbed = new EmbedBuilder()
        .setTitle(
          `${interaction.client.user.username}'s List of ${category} Commands`
        )
        .setColor(Colors.Green);

      if (category && commands) {
        const sortedCommands = [...commands].sort((a, b) =>
          a.data.name.localeCompare(b.data.name)
        );
        let values = [];
        sortedCommands.map(
          (cmd, index) =>
            (values[index] = {
              name: `${cmd.data.name.replace(
                cmd.data.name.charAt(0),
                cmd.data.name.charAt(0).toUpperCase()
              )}`,
              value: `${cmd.data.description}`,
            })
        );
        helpEmbed.addFields(...values);
        function getCategories() {
          let CommandCategoriesFinal = [];
          let CommandCategoriesStringArray = Array.from(
            interaction.client.CommandCategories.keys()
          );
          CommandCategoriesStringArray.forEach((category) => {
            CommandCategoriesFinal.push({
              name: category,
              description: category,
              label: category,
              value: category,
            });
          });
          return CommandCategoriesFinal;
        }
        await interaction.reply({
          embeds: [helpEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setPlaceholder("Select A Category")
                .addOptions(...getCategories())
                .setCustomId("helpSelectMenu")
            ),
          ],
        });
      }
      if (!commands) {
        helpEmbed
          .setTitle(
            `Invalid Category! - ${inlineCode(`/help category:` + category)}`
          )
          .addFields({
            name: "Unknown Command!",
            value: `\`${category}\` category was not found. Type \`/help\` to see the list of available categories.`,
          })
          .setColor("#f4424b");

        await interaction.reply({ embeds: [helpEmbed] });
        return;
        return;
      }
      return;
    }

    // If a specific command is requested
    if (commandName) {
      const specificHelpEmbed = new EmbedBuilder()
        .setTitle("Command Specific Help")
        .setColor(Colors.Green);

      const subcommand = Array.from(interaction.client.Commands.values()).find(
        (c) => c.data.name === commandName
      );

      if (!subcommand) {
        specificHelpEmbed
          .addFields({
            name: "Unknown Command!",
            value: `\`${commandName}\` was not found. Type \`/help\` to see the list of available commands.`,
          })
          .setColor("#f4424b");

        await interaction.reply({ embeds: [specificHelpEmbed] });
        return;
      }

      specificHelpEmbed
        .setTitle(`Command Specific Help - ${subcommand.data.name}`)
        .setDescription(`${subcommand.data.description}`);
      if (subcommand.data.options.length !== 0) {
        subcommand.data.options.forEach((option) => {
          specificHelpEmbed.addFields({
            name: `${subcommand.data.name} **\`${option.name}\`**`,
            value: `${option.description}`,
          });
        });
        specificHelpEmbed.addFields({
          name: "Command Type",
          value: `${codeBlock(subcommand.data.commandType)}`,
        });
      }

      await interaction.reply({ embeds: [specificHelpEmbed] });
    }
  },
};
