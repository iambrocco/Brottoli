// Import
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Modal, TextInputComponent, MessageActionRow, MessageAttachment } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const canvas = require("canvas").createCanvas(600, 600, "svg").getContext("2d");
const Icons = require("../Data/icons.json").Icons;
// Creating the command
module.exports = {
  // Exporting the Data
  data: new SlashCommandBuilder()
    .setName("minecraft")
    .setDescription("Minecraft related Commands")
    .addSubcommandGroup((group) =>
      group
        .setName("achievement")
        .setDescription("Generates A Minecraft Achievement Image")
        .addSubcommand((sub2) =>
          sub2
            .setName("icons")
            .setDescription(
              "Sends a list of the icons for /achievement available"
            )
        )
        .addSubcommand((sub2) =>
          sub2
            .setName("generate")
            .setDescription("Generates A Minecraft Achievement Image")
        )
    )
 ,   
  async execute(interaction) {
    if (interaction.options.getSubcommandGroup() === "achievement") {
      if (interaction.options.getSubcommand() == "generate") {
        const modal = new Modal()
          .setCustomId("achievementModal")
          .setTitle("Minecraft Achievement Generator");
        // Add components to modal
        // Create the text input components
        const yellowTextInput = new TextInputComponent()
          .setCustomId("yellowTextInput")
          .setPlaceholder("Achievement Get!")
          .setRequired(true)
          // The label is the prompt the user sees for this input
          .setLabel("Input The Text in yellow")
          // Short means only a single line of text
          .setStyle("SHORT");
        const whiteTextInput = new TextInputComponent()
          .setCustomId("whiteTextInput")
          .setPlaceholder("DIAMONDS!")
          .setRequired(true)
          .setLabel("Input The Text in white")
          // Paragraph means multiple lines of text.
          .setStyle("SHORT");
        const iconInput = new TextInputComponent()
          .setCustomId("iconInput")
          .setLabel("What Icon Do You Want?")
          .setPlaceholder("/achievement icons for list of possible icons")
          .setStyle("SHORT");
        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new MessageActionRow().addComponents(
          yellowTextInput
        );
        const secondActionRow = new MessageActionRow().addComponents(
          whiteTextInput
        );
        const thirdActionRow = new MessageActionRow().addComponents(iconInput);
        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        // Show the modal to the user

        await interaction.showModal(modal);
      }
      if (interaction.options.getSubcommand() === "icons") {
        var commandsEmbed1 = new MessageEmbed()
          .setTitle("Achievement Command Icon List 1/3")
          .setColor("RANDOM");
        var commandsEmbed2 = new MessageEmbed()
          .setTitle("Achievement Command Icon List 2/3")
          .setColor("RANDOM");
        var commandsEmbed3 = new MessageEmbed()
          .setTitle("Achievement Command Icon List 3/3")
          .setColor("RANDOM");

        Icons.forEach((icon, i) => {
          if (i <= 12) {
            commandsEmbed1.addFields({
              name: `Icon ${i + 1}`,
              value: `${icon}`,
              inline: true,
            });
          }
          if (i <= 25 && i > 12) {
            commandsEmbed2.addFields({
              name: `Icon ${i + 1}`,
              value: `${icon}`,
              inline: true,
            });
          }
          if (i <= 38 && i > 12 && i > 25) {
            commandsEmbed3.addFields({
              name: `Icon ${i + 1}`,
              value: `${icon}`,
              inline: true,
            });
          }
        });
        await interaction.reply({
          embeds: [commandsEmbed1, commandsEmbed2, commandsEmbed3],
          ephemeral: true,
        });
      }
    }
    
  },
};
