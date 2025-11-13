const {
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  inlineCode,
  Events,
  MessageFlags
} = require("discord.js");

const ErrorEmbed = require("../../Structures/ErrorEmbed.js");

const guildSettings = new Map();

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "enablejl"
    ) {
      const enabled = interaction.values[0];
      if (enabled === "0") {
        return interaction.reply({
          content: "Join/Leave Messages Were Successfully Disabled",
          flags: MessageFlags.Ephemeral,
        });
      }
      if (enabled === "1") {
        guildSettings.set(interaction.guildId, { enabled: true });
        return interaction.reply({
          content: "Please select a join message channel",
          flags: MessageFlags.Ephemeral,
          components: [
            new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId(`selectJoinChannel_${interaction.guildId}`)
                .setChannelTypes(ChannelType.GuildText)
                .setPlaceholder("Select A Join Message Channel")
            ),
          ],
        });
      }
    }

    if (interaction.isChannelSelectMenu()) {
      const guildData = guildSettings.get(interaction.guildId) || {};

      if (interaction.customId === `selectJoinChannel_${interaction.guildId}`) {
        guildData.joinChannelId = interaction.channels.first().id;
        guildSettings.set(interaction.guildId, guildData);

        return interaction.reply({
          content: "Please select a leave message channel",
          flags: MessageFlags.Ephemeral,
          components: [
            new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId(`selectLeaveChannel_${interaction.guildId}`)
                .setChannelTypes(ChannelType.GuildText)
                .setPlaceholder("Select A Leave Message Channel")
            ),
          ],
        });
      }
      if (
        interaction.customId === `selectLeaveChannel_${interaction.guildId}`
      ) {
        guildData.leaveChannelId = interaction.channels.first().id;
        guildSettings.set(interaction.guildId, guildData);

        return interaction.update({
          content: "Set the join/leave messages",
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `setJoinLeaveMessagesButton_${interaction.guildId}`
                )
                .setStyle(ButtonStyle.Primary)
                .setLabel("Set Messages")
            ),
          ],
        });
      }
    }

    if (
      interaction.isButton() &&
      interaction.customId ===
      `setJoinLeaveMessagesButton_${interaction.guildId}`
    ) {
      return interaction.showModal(
        new ModalBuilder()
          .setTitle("Set Join/Leave Messages")
          .setCustomId("jlMessagesModal")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setLabel("Join Message")
                .setCustomId("joinMSG")
                .setStyle(TextInputStyle.Short)
                .setValue(
                  "Welcome {member} to {serverName}! We are now {memberCount}!"
                )
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setLabel("Leave Message")
                .setCustomId("leaveMSG")
                .setStyle(TextInputStyle.Short)
                .setValue(
                  "{user} has left {serverName}! We are now {memberCount}! :("
                )
            )
          )
      );
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "jlMessagesModal"
    ) {
      const guildData = guildSettings.get(interaction.guildId) || {};
      const joinmsg = interaction.fields.getTextInputValue("joinMSG");
      const leavemsg = interaction.fields.getTextInputValue("leaveMSG");

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Successfully set Join/Leave Messages")
            .addFields(
              { name: "Join Message", value: inlineCode(joinmsg) },
              { name: "Leave Message", value: inlineCode(leavemsg) },
              {
                name: "Join Message Channel",
                value: `<#${guildData.joinChannelId}>`,
              },
              {
                name: "Leave Message Channel",
                value: `<#${guildData.leaveChannelId}>`,
              }
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });

      client.query(
        `SELECT * FROM guilds WHERE guildId = ?`,
        [interaction.guildId],
        (err, reslt) => {
          if (err) {
            console.error("Database query failed:", err);
            return;
          }
          if (reslt.length > 0) {
            client.query(
              `UPDATE \`guilds\` SET \`join_channel\`=?,\`leave_channel\`=?,\`join_message\`=?,\`leave_message\`=? WHERE \`guildId\`=?`,
              [
                guildData.joinChannelId,
                guildData.leaveChannelId,
                joinmsg,
                leavemsg,
                interaction.guildId,
              ],
              (insertErr) => {
                if (insertErr) {
                  interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({ name: 'An Error Occured', value: `${insertErr}` })] })
                }
              }
            );
          }
          if (!reslt || reslt.length === 0) {
            client.query(
              `INSERT INTO \`guilds\`(\`guildId\`, \`timezone\`, \`customConfig\`, \`premium\`, \`join_message\`, \`join_channel\`, \`leave_message\`, \`leave_channel\`, \`modlogs_channel\`, \`sugesstions_channel\`) VALUES (?,?,?,?,?,?,?,?,?,?)`,
              [
                interaction.guildId,
                "UTC",
                0,
                0,
                joinmsg,
                guildData.joinChannelId,
                leavemsg,
                guildData.leaveChannelId,
                0,
                0
              ],
              (insertErr) => {
                if (insertErr) {
                  interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({ name: 'An Error Occured', value: `${insertErr}` })] })
                }
              }
            );
          }
        }
      );

      guildSettings.delete(interaction.guildId); // Clear the temporary data
    }
  },
};
