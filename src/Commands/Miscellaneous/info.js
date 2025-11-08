const {
  EmbedBuilder,
  Colors,
  User,
  bold,
  codeBlock,
  inlineCode,
  Role,
  Guild, InteractionContextType, ApplicationIntegrationType
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const { channelTypes } = require("../../Data/reusableFunctions.js");
module.exports = {
  data: new CommandBuilder()
    .setName("info")
    .setDescription("Get Information About a Specific Thing")
    .setCategory("Miscellaneous")
    .setType(CommandTypes.SLASH) 
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)

    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Get a User's Info")
        .addUserOption((option) =>
          option.setName("user").setDescription("The Desired User")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("role")
        .setDescription("Get a Role's Info")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The Desired Role")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Get a Channel's Info")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("The Desired Channel")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Get The Server's Info")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("emoji")
        .setDescription("Get an Emoji's Info")
        .addStringOption((option) =>
          option.setName("emoji").setDescription("The Desired Emoji")
        )
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    let infoEmbed = new EmbedBuilder();
    let rolePermsString = "";

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
            `${user.avatarURL()
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
        let rolePerms = role.permissions.toArray();
        rolePerms.forEach((rolePerm) => {
          rolePermsString += `${inlineCode(rolePerm)}${bold(",")} `;
        });
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
            },
            {
              name: `Role Icon URL`,
              value: `${role.iconURL({ extension: "png" })
                  ? `[PNG](${role.iconURL({ extension: "png" })})`
                  : inlineCode("Role Has No Icon")
                }`,
              inline: true,
            }
            // {
            //   name: "Role Permissions",
            //   value: `${rolePermsString}`,
            // }
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
              value: `${inlineCode(channelTypes[channel.type])} (${channel.type
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
              value: `${server.afkChannel
                  ? server.afkChannel
                  : inlineCode("No AFK Channel")
                }`,
              inline: true,
            },
            {
              name: `Server Rules Channel`,
              value: `${server.rulesChannel
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
            `${server.iconURL()
              ? server.iconURL()
              : "https://i.imgur.com/p8oEVeT.png"
            }`
          )
          .setColor(Colors.Greyple);
        break;
      case "emoji":
        let emojiString = interaction.options.getString("emoji");
        let emojiId = emojiString.match(/:(\d+)>$/)[1];
        // TO DO: IMPLEMENT EMOJI INFO
        let fetchedEmoji = interaction.guild.emojis.fetch(emojiId);
        let emoji = await fetchedEmoji;
        infoEmbed.setTitle(`${inlineCode(emoji.name)} Emoji Info`);
        infoEmbed.addFields(
          {
            name: `Emoji ID`,
            value: `${codeBlock(emoji.id)}`,
            inline: false,
          },
          {
            name: `Is Emoji Animated?`,
            value: `${inlineCode(emoji.animated)}`,
            inline: true,
          },
          {
            name: `Emoji Identifier`,
            value: `${inlineCode(emoji.identifier)}`,
            inline: true,
          },
          {
            name: `Emoji Created At`,
            value: `${codeBlock(emoji.createdAt)}`,
            inline: false,
          },
          {
            name: `Is Emoji Available?`,
            value: `${inlineCode(emoji.available)}`,
            inline: true,
          },
          {
            name: `Does Emoji Require Colons?`,
            value: `${inlineCode(emoji.requiresColons)}`,
            inline: true,
          },
          {
            name: `Is Emoji Managed?`,
            value: `${inlineCode(emoji.managed)}`,
            inline: true,
          }
        );

        break;
    }
    await interaction.reply({
      embeds: [infoEmbed],
    });
  },
};
