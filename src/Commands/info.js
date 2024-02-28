const {
  EmbedBuilder,
  Colors,
  User,
  bold,
  codeBlock,
  inlineCode,
  Role,
  Guild,
} = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");

module.exports = {
  data: new CommandBuilder()
    .setName("info")
    .setDescription("Get info about a specific thing")
    .setCategory("Miscellaneous")
    .setType(CommandTypes.SLASH)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Get a User's Info")
        .addUserOption((option) =>
          option.setName("user").setDescription("The desired user")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("role")
        .setDescription("Get a Role's Info")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The desired role")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Get a Channel's Info")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("The desired channel")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Get The Server's Info")
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    let channelTypes = {
      0: "GuildText",
      1: "DM",
      2: "GuildVoice",
      3: "GroupDM",
      4: "GuildCategory",
      5: "GuildAnnouncement",
      10: "AnnouncementThread",
      11: "PublicThread",
      12: "PrivateThread",
      13: "GuildStageVoice",
      14: "GuildDirectory",
      15: "GuildForum",
    };
    let subcommand = interaction.options.getSubcommand();
    let infoEmbed = new EmbedBuilder();
    switch (subcommand) {
      case "user":
        /**
         * @type {User} user
         */
        let user = interaction.options.getUser("user")
          ? interaction.options.getUser("user")
          : interaction.user;
        infoEmbed
          .setTitle(`${user.displayName}'s Info`)
          .setThumbnail(
            `${
              user.avatarURL()
                ? user.avatarURL()
                : "https://i.imgur.com/p8oEVeT.png"
            }`
          )
          .addFields(
            {
              name: `User ID`,
              value: `${codeBlock(user.id)}`,
            },
            {
              name: `Username`,
              value: `${inlineCode(user.tag)}`,
              inline: true,
            },
            {
              name: `Display Name`,
              value: `${inlineCode(user.displayName)}`,
              inline: true,
            },
            {
              name: "User Joined Server At",
              value: `${codeBlock(
                (
                  await interaction.guild.members.fetch(user.id)
                ).joinedAt.toUTCString()
              )}`,
            },
            {
              name: `Server Nickname`,
              value: `${inlineCode(
                interaction.guild.members.resolve(user).nickname ??
                  user.globalName ??
                  user.username
              )}`,
              inline: true,
            },
            {
              name: "User Created At",
              value: `${codeBlock(user.createdAt.toUTCString())}`,
            }
          )
          .setColor(Colors.DarkGold);
        break;
      case "role":
        /**
         * @type {Role} role
         */
        let role = interaction.options.getRole("role");
        infoEmbed
          .setTitle(`${inlineCode(role.name)} Role Info`)
          .addFields(
            {
              name: `Role Name`,
              value: `${inlineCode(role.name)}`,
            },
            {
              name: `Role ID`,
              value: `${codeBlock(role.id)}`,
            },
            {
              name: `Role Color`,
              value: `${inlineCode(role.hexColor)}`,
              inline: true,
            },
            {
              name: `Role Position`,
              value: `${inlineCode(role.position)}`,
              inline: true,
            },
            {
              name: `Role Created At`,
              value: `${codeBlock(role.createdAt.toUTCString())}`,
            }
          )
          .setColor(role.hexColor);
        break;
      case "channel":
        /**
         * @type {import("discord.js").Channel} channel
         */
        let channel = interaction.options.getChannel("channel")
          ? interaction.options.getChannel("channel")
          : interaction.channel;
        infoEmbed
          .setTitle(`${inlineCode(channel.name)} Channel Info`)
          .addFields(
            {
              name: `Channel Name`,
              value: `${inlineCode(channel.name)}`,
              inline: true,
            },
            {
              name: "Channel ID",
              value: `${codeBlock(channel.id)}`,
            },
            {
              name: `Channel Type`,
              value: `${inlineCode(channelTypes[channel.type])} (${
                channel.type
              })`,
              inline: true,
            },
            {
              name: "NSFW Channel?",
              value: `${channel.nsfw}`,
              inline: true,
            },
            {
              name: `Channel Created At`,
              value: `${codeBlock(channel.createdAt.toUTCString())}`,
            }
          )
          .setColor(Colors.DarkGreen);
        break;
      case "server":
        /**
         * @type {Guild} server
         */
        let server = interaction.guild;
        infoEmbed
          .setTitle(`${server.nameAcronym} Server Info`)
          .addFields(
            {
              name: `Server Name`,
              value: `${inlineCode(server.name)}`,
            },
            {
              name: `Server ID`,
              value: `${codeBlock(server.id)}`,
            },
            {
              name: "Server Member Count",
              value: `${server.memberCount}`,
              inline: true,
            },
            {
              name: `Server Owner`,
              value: `${(await interaction.guild.fetchOwner()).user}`,
              inline: true,
            },
            {
              name: `Server AFK Channel`,
              value: `${
                server.afkChannel
                  ? server.afkChannel
                  : inlineCode("No AFK Channel")
              }`,
              inline: true,
            },
            {
              name: `Server Rules Channel`,
              value: `${
                server.rulesChannel
                  ? server.rulesChannel
                  : inlineCode("No Rules Channel")
              }`,
              inline: true,
            },
            {
              name: `Server Created At`,
              value: `${codeBlock(server.createdAt.toUTCString())}`,
            }
          )
          .setThumbnail(
            `${
              server.iconURL()
                ? server.iconURL()
                : "https://i.imgur.com/p8oEVeT.png"
            }`
          )
          .setColor(Colors.Greyple);
        break;
    }
    await interaction.reply({ embeds: [infoEmbed] });
  },
};
