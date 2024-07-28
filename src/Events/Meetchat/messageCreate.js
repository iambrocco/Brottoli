const { Message, EmbedBuilder, Colors } = require("discord.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
const Client = require("../../Structures/Client.js");
const MeetChatClientConnectionStates = require("../../Structures/Enums/MeetChatClientConnectionStates.js");

module.exports = {
  name: "messageCreate",
  /**
   * @param {Client} client
   * @param {Message} message
   */
  async execute(client, message) {
    let msgTemplate = `**${message.author.username}** » ${
      message.content.length > 1900
        ? message.content.slice(0, 1950) + `...\n**This Message Doesn't Fit.**`
        : message.content
    }`;
    const db = client.db;
    if (message.author.bot) return;

    db.query(
      `SELECT * FROM \`meetchat\` WHERE channelOneId = ? OR channelTwoId = ? AND channelTwoId != 0 AND connectionState = ?`,
      [
        message.channelId,
        message.channelId,
        MeetChatClientConnectionStates.CONNECTED,
      ],
      async (err, result, fields) => {
        if (err) {
          interaction.reply({
            ephemeral: true,
            embeds: [
              new ErrorEmbed().setError({
                name: "An Error Occured",
                value: `${err}`,
              }),
            ],
          });
        }
        if (result.length == 0 || !result[0]) {
          return;
        }
        let files = message.attachments.at(0)
          ? (() => {
              let farr = [];
              message.attachments.forEach((attachment) => {
                farr.push({
                  attachment: attachment.url,
                  name: attachment.name,
                });
              });
              return farr;
            })()
          : [];
        if (result[0].channelOneId == message.channelId) {
          (
            await client.channels.fetch(result[0].channelTwoId, { force: true })
          ).send({ content: msgTemplate, files: files });
        }
        if (result[0].channelTwoId == message.channelId) {
          (
            await client.channels.fetch(result[0].channelOneId, { force: true })
          ).send({ content: msgTemplate, files: files });
        }
      }
    );
  },
};
