const {
  CommandInteraction,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
module.exports = {
  data: new CommandBuilder()
    .setName("reactionroles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDescription("Add Reaction Roles")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a reaction role")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The Message ID you want to add reaction roles to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("The Emoji you want the users to react with")
            .setRequired(true)
        )
        .addMentionableOption((option) =>
          option
            .setName("role")
            .setDescription(
              "The Role you want the users to get when they react"
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "The Channel containing the message you're adding reaction roles to"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a reaction role")
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("the emoji you want to remove")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("the message that has the emoji you want to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("list all reaction roles in this server")
    )
    .setType(CommandTypes.SLASH)
    .setCategory("Moderation"),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    if(!interaction.client.isDatabaseConnected()) return interaction.reply({flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({name: 'Database Error', value: 'The database is not connected.'})]});

    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    subcommand == "add"
      ? (() => {
          const channel = interaction.options.getChannel("channel");
          const role = interaction.options.getMentionable("role");
          const messageid = interaction.options.getString("message");
          const emoji = interaction.options.getString("emoji");
          let channelID = channel.id;
          let roleID = role.id;
          let emojiName = emoji.includes(":") ? emoji.split(":")[1] : emoji;

          interaction.guild.channels.fetch(channelID).then((channel) => {
            channel.messages
              .fetch(messageid)
              .catch(() => {
                return interaction.editReply(`Error! Failed To Find Message!`);
              })
              .then((message) => {
                if (!message) return;
                message.react(emoji);
                interaction.client.db.query(
                  `INSERT INTO \`reaction_roles\` (channelId, messageId, emoji, roleId, guildId) VALUES (?, ?, ?, ?, ?)`,
                  [
                    channelID,
                    messageid,
                    emojiName,
                    roleID,
                    interaction.guildId,
                  ],
                  async (err) => {
                    if (err) {
                      return await interaction.editReply(`An Error Occured.`);
                    }

                    await interaction.editReply({
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("Successfully Added Reaction Role")
                          .setColor(Colors.Green)
                          .addFields(
                            {
                              name: `Reaction Emoji`,
                              value: `${emoji}`,
                              inline: true,
                            },
                            {
                              name: `Reaction Message ID`,
                              value: `${messageid}`,
                              inline: true,
                            },
                            {
                              name: `Reaction Channel`,
                              value: `${channel}`,
                              inline: true,
                            },
                            {
                              name: `Reaction Role`,
                              value: `${role}`,
                            }
                          ),
                      ],
                    });
                  }
                );
              });
          });
        })()
      : subcommand == "remove"
      ? (() => {
          const messageid = interaction.options.getString("message");
          const emoji = interaction.options.getString("emoji");
          let emojiName = emoji.includes(":") ? emoji.split(":")[1] : emoji;

          interaction.client.db.query(
            "DELETE FROM `reaction_roles` WHERE messageId = ? AND emoji = ?",
            [messageid, emojiName],
            async (err) => {
              if (err) return interaction.editReply(`An Error Occured.`);
              await interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`Successfully Removed Reaction Role`)
                    .addFields({
                      name: "Reaction Role Data",
                      value: `msg: ${messageid} - emoji: ${emojiName}`,
                    }),
                ],
              });
            }
          );
        })()
      : subcommand == "list"
      ? (() => {
          interaction.client.db.query(
            `SELECT * FROM reaction_roles WHERE guildId = ?`,
            [interaction.guildId],
            (err, result) => {
              if (err) {
                return interaction.editReply("An Error Occurred.");
              }
              if (result.length === 0 || !result[0]) {
                return interaction.editReply({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle(
                        `${interaction.guild.name}'s Reaction Roles List`
                      )
                      .setDescription(
                        `No Reaction Roles were found for this server.`
                      ),
                  ],
                });
              }

              const reactionRolesMap = new Map();

              result.forEach((reactionRole) => {
                const key = `${reactionRole.messageId}-${reactionRole.channelId}`;
                if (!reactionRolesMap.has(key)) {
                  reactionRolesMap.set(key, []);
                }
                reactionRolesMap.get(key).push(reactionRole);
              });

              const rrs = [];
              reactionRolesMap.forEach((reactionRoles, key) => {
                const reactionDetails = reactionRoles
                  .map((rr) => `${rr.emoji} - <@&${rr.roleId}>`)
                  .join(", ");

                const [messageId, channelId] = key.split("-");
                const guildId = interaction.guildId;

                rrs.push({
                  name: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`,
                  value: reactionDetails,
                });
              });

              return interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .addFields(...rrs)
                    .setTitle(
                      `${interaction.guild.name}'s Reaction Roles List`
                    ),
                ],
              });
            }
          );
        })()
      : "";
  },
};
