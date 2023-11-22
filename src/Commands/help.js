const { EmbedBuilder, Colors, codeBlock } = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder");
module.exports = {
  data: new CommandBuilder()
    .setName("help")
    .setDescription("Use this command to get help with other commands")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The Command You want help with")
        .setRequired(false)
    )

    .setCategory("Utility")
    .setType("BOTH"),
  async execute(interaction, args) {
    let commandName = interaction.content
      ? args[1].toLowerCase()
      : interaction.options.getString("command").toLowerCase();

    if (!commandName) {
      const helpEmbed = new EmbedBuilder()
        .setTitle(`${interaction.client.user.username}'s List of Commands`)
        .setColor(Colors.Green);
      const groupedCommands = {};

      interaction.client.Commands.forEach((command) => {
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
        const value = commands
          .map((cmd) => `${cmd.data.name}: ${cmd.data.description}`)
          .join("\n");
        helpEmbed.addFields({ name: `${category}`, value: `${value}` });
      }

      await interaction.reply({ embeds: [helpEmbed] });
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
