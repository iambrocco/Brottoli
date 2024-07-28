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
} = require("discord.js");

const ErrorEmbed = require("../../Structures/ErrorEmbed.js");

const guildSettings = new Map();

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    const db = client.db;

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "enablejl"
    ) {
      const enabled = interaction.values[0];
      if (enabled === "0") {
        return interaction.reply({
          content: "Join/Leave Messages Were Successfully Disabled",
          ephemeral: true,
        });
      }
      if (enabled === "1") {
        guildSettings.set(interaction.guildId, { enabled: true });
        return interaction.reply({
          content: "Please select a join message channel",
          ephemeral: true,
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
          ephemeral: true,
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
        ephemeral: true,
      });

      db.query(
        `SELECT * FROM join_leave WHERE guildId = ?`,
        [interaction.guildId],
        (err, reslt) => {
          if (err) {
            console.error("Database query failed:", err);
            return;
          }
          if (reslt.length > 0) {
            db.query(
              `UPDATE \`join_leave\` SET \`joinChannelId\`=?,\`leaveChannelId\`=?,\`guildId\`=?,\`joinMessage\`=?,\`leaveMessage\`=?,\`enabled\`=?`,
              [
                guildData.joinChannelId,
                guildData.leaveChannelId,
                interaction.guildId,
                joinmsg,
                leavemsg,
                "1",
              ],
              (insertErr) => {
                if (insertErr) {
                  interaction.reply({ephemeral: true, embeds: [new ErrorEmbed().setError({name: 'An Error Occured', value: `${insertErr}`})]})
                }
              }
            );
          }
          if (!reslt || reslt.length === 0) {
            db.query(
              `INSERT INTO join_leave (joinChannelId, leaveChannelId, guildId, joinMessage, leaveMessage, enabled) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                guildData.joinChannelId,
                guildData.leaveChannelId,
                interaction.guildId,
                joinmsg,
                leavemsg,
                "1",
              ],
              (insertErr) => {
                if (insertErr) {
                  interaction.reply({ephemeral: true, embeds: [new ErrorEmbed().setError({name: 'An Error Occured', value: `${insertErr}`})]})
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
