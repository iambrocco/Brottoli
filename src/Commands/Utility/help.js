// help.js — Fully working help menu with smart autocomplete + pagination + prefix support
const {
  EmbedBuilder,
  Colors,
  codeBlock,
  inlineCode,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");

// Commands per page
const PAGE_SIZE = 6;

module.exports = {
  data: new CommandBuilder()
    .setName("help")
    .setDescription("Shows command list or information about a specific command")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category of commands to view")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The specific command you want help with")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .setCategory("Utility")
    .setType(CommandTypes.BOTH),

  // ✅ Autocomplete Handler
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const category = interaction.options.getString("category");

    let cmds = [];

    if (category) {
      const cat =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      const set = interaction.client.CommandCategories.get(cat) || [];
      cmds = [...set].map((c) => c.data.name);
    } else {
      cmds = Array.from(interaction.client.Commands.values()).map(
        (c) => c.data.name
      );
    }

    const filtered = cmds
      .filter((n) => n.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((n) => ({ name: n, value: n }));

    return interaction.respond(filtered);
  },

  /**
   * Slash + Prefix Handler
   * @param {*} interaction
   * @param {*} args
   */
  async execute(interaction, args) {
    const client = interaction.client;
    const isPrefix = !!interaction.content;

    let inputCategory = null;
    let inputCommand = null;

    // --------------- PREFIX PARSING FIX ---------------
    // Many frameworks pass args where args[0] is the command name (e.g. "help").
    // We must skip that token if present so "!help fun" resolves "fun" as the first argument.
    if (isPrefix) {
      // If args is falsy or empty, treat as no args -> show all
      if (!args || args.length === 0) {
        inputCategory = "all";
      } else {
        // Determine starting index: skip the command token if it equals the command name
        let idx = 0;
        if (args[0] && typeof args[0] === "string") {
          if (args[0].toLowerCase() === this.data.name.toLowerCase()) {
            idx = 1;
          }
        }

        const token = args[idx] ? String(args[idx]).toLowerCase() : null;

        if (!token) {
          inputCategory = "all";
        } else if (token.startsWith("category:")) {
          inputCategory = token.split("category:")[1];
        } else if (token.startsWith("command:")) {
          inputCommand = token.split("command:")[1];
        } else {
          // Could be either a category or a command name.
          // If it matches a category key (case-insensitive) treat as category, otherwise command.
          const cats = Array.from(client.CommandCategories.keys()).map((c) =>
            c.toLowerCase()
          );
          if (cats.includes(token)) inputCategory = token;
          else inputCommand = token;
        }
      }
    } else {
      // SLASH MODE
      inputCategory = interaction.options.getString("category");
      inputCommand = interaction.options.getString("command");
      if (!inputCategory && !inputCommand) inputCategory = "all";
    }

    // ✅ handle specific command help
    if (inputCommand) {
      return this.showCommandHelp(interaction, inputCommand);
    }

    // ✅ otherwise show categories or all commands
    return this.showCategoryList(interaction, inputCategory || "all");
  },

  // ✅ SPECIFIC COMMAND HELP
  async showCommandHelp(interaction, name) {
    const cmd = Array.from(interaction.client.Commands.values()).find(
      (c) => c.data.name.toLowerCase() === name.toLowerCase()
    );

    const embed = new EmbedBuilder().setColor(Colors.Green);

    if (!cmd) {
      embed
        .setTitle("Unknown Command")
        .setColor("#ff3333")
        .setDescription(
          `The command **${inlineCode(
            name
          )}** does not exist.\nUse ${inlineCode("/help")} to view all commands.`
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    embed
      .setTitle(`Help for Command: ${cmd.data.name}`)
      .setDescription(cmd.data.description);

    if (cmd.data.options.length > 0) {
      embed.addFields(
        ...cmd.data.options.map((o) => ({
          name: `Option: ${o.name}`,
          value: o.description || "No description",
        }))
      );
    }

    embed.addFields({
      name: "Command Type",
      value: codeBlock(cmd.data.commandType.toString()),
    });

    return interaction.reply({ embeds: [embed] });
  },

  // ✅ CATEGORY or ALL LIST
  async showCategoryList(interaction, category) {
    const client = interaction.client;
    const isPrefix = !!interaction.content;

    let commandArray = [];

    if (category === "all") {
      // ✅ flatten all categories
      const all = [];
      for (const set of client.CommandCategories.values()) {
        for (const cmd of set) all.push(cmd);
      }
      commandArray = all;
    } else {
      const formatted =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      const set = client.CommandCategories.get(formatted);
      if (!set) {
        const err = new EmbedBuilder()
          .setColor("#ff3333")
          .setTitle("Invalid Category")
          .setDescription(
            `The category ${inlineCode(
              category
            )} doesn't exist.\nUse ${inlineCode("/help")} to view all categories.`
          );
        return interaction.reply({ embeds: [err], ephemeral: true });
      }
      commandArray = [...set];
    }

    // ✅ sort alphabetically
    commandArray.sort((a, b) => a.data.name.localeCompare(b.data.name));

    // Build pages
    const pages = [];
    for (let i = 0; i < commandArray.length; i += PAGE_SIZE) {
      const chunk = commandArray.slice(i, i + PAGE_SIZE);

      const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle(
          category === "all"
            ? `${client.user.username}'s Commands`
            : `${client.user.username}'s ${category} Commands`
        )
        .setFooter({
          text: `Page ${Math.floor(i / PAGE_SIZE) + 1}/${Math.ceil(
            commandArray.length / PAGE_SIZE
          )}`,
        });

      embed.addFields(
        ...chunk.map((c) => ({
          name: c.data.name,
          value: c.data.description || "No description",
        }))
      );

      pages.push(embed);
    }

    // ✅ prefix mode → no buttons
    if (isPrefix) {
      for (const e of pages) {
        await interaction.reply({ embeds: [e] });
      }
      return;
    }

    // ✅ Slash mode → full pagination
    return this.paginate(interaction, pages);
  },

  // ✅ Pagination Handler
  async paginate(interaction, pages) {
    if (pages.length === 0) {
      return interaction.reply({
        content: "No commands found.",
        ephemeral: true,
      });
    }

    let page = 0;
    const userId = interaction.user.id;

    const row = (p) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`first_${userId}`)
          .setEmoji("⏮️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(p === 0),
        new ButtonBuilder()
          .setCustomId(`prev_${userId}`)
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(p === 0),
        new ButtonBuilder()
          .setCustomId(`next_${userId}`)
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(p === pages.length - 1),
        new ButtonBuilder()
          .setCustomId(`last_${userId}`)
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(p === pages.length - 1)
      );

    const msg = await interaction.reply({
      embeds: [pages[page]],
      components: [row(page)],
      withResponse: true,
    });

    const collector = msg.createMessageComponentCollector({
      time: 2 * 60 * 1000,
    });

    collector.on("collect", async (btn) => {
      if (btn.user.id !== userId)
        return btn.reply({
          content: "You cannot control this menu.",
          ephemeral: true,
        });

      const id = btn.customId;

      if (id.startsWith("first_")) page = 0;
      if (id.startsWith("prev_")) page = Math.max(0, page - 1);
      if (id.startsWith("next_"))
        page = Math.min(pages.length - 1, page + 1);
      if (id.startsWith("last_")) page = pages.length - 1;

      await btn.update({
        embeds: [pages[page]],
        components: [row(page)],
      });
    });

    collector.on("end", async () => {
      // disable all buttons
      const disabledRow = new ActionRowBuilder().addComponents(
        ...row(page).components.map((b) => ButtonBuilder.from(b).setDisabled(true))
      );
      try {
        await msg.edit({ components: [disabledRow] });
      } catch {}
    });
  },
};
