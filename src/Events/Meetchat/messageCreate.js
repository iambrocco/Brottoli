const { Message, Events } = require("discord.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
const Client = require("../../Structures/Client.js");
const MeetChatClientConnectionStates = require("../../Structures/Enums/MeetChatClientConnectionStates.js");
const { filterText } = require("../../Data/reusableFunctions.js");

module.exports = {
  name: Events.MessageCreate,
  /**
   * @param {Client} client
   * @param {Message} message
   */
  async execute(client, message) {
    const db = client.db;
    if (!client.isDatabaseConnected()) return;
    if (message.author.bot) return;
    let filtered = filterText(message.content).text;
    const msgTemplate = `**${message.author.username}** » ${
      filtered.length > 1900
        ? filtered.slice(0, 1950) + `...\n**This Message Doesn't Fit.**`
        : filtered
    }`;

    db.query(
      `SELECT * FROM \`meetchat\` WHERE (channelOneId = ? OR channelTwoId = ?) AND channelTwoId != 0 AND connectionState = ?`,
      [
        message.channelId,
        message.channelId,
        MeetChatClientConnectionStates.CONNECTED,
      ],
      async (err, result, fields) => {
        if (err) {
          return message.channel.send({
            embeds: [
              new ErrorEmbed().setError({
                name: "An Error Occurred",
                value: `${err}`,
              }),
            ],
          });
        }
        if (result.length == 0 || !result[0]) {
          return;
        }

        const files =
          message.attachments.size > 0
            ? message.attachments
            .filter(attachment => !filterText(attachment.name)) // Exclude bad names
            .map(attachment => ({
                attachment: attachment.url,
                name: attachment.name,
            })) : [];

        const targetChannelId =
          result[0].channelOneId == message.channelId
            ? result[0].channelTwoId
            : result[0].channelOneId;

        if (targetChannelId == 0) return;

        const targetChannel = await client.channels.fetch(targetChannelId, {
          force: true,
        });
        if (targetChannel) {
          targetChannel.send({ content: msgTemplate, files: files });
        }
      }
    );
  },
};
