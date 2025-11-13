const { MessageFlags } = require("discord.js");
const MeetChatConnectionStates = require("./Enums/MeetChatClientConnectionStates.js");
const ErrorEmbed = require("./ErrorEmbed.js");
class MeetChatClient {
  constructor(channelOne, client, interaction) {
    this.client = client;
    this.channelOne = channelOne;
    this.channelTwo = 0;
    this.connectionState = MeetChatConnectionStates.WAITING;
    this.connectedOn = 0;
    this.interaction = interaction;
    this.guildOne = this.interaction.guildId;
    this.guildTwo = 0;
  }
  handleError(err) {
    if (err) {
      this.interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new ErrorEmbed().setError({
            name: "An Error Occured",
            value: `${err}`,
          }),
        ],
      });
      return;
    }
  }
  async init() {
    this.client.query(
      `SELECT * FROM meetchat WHERE channelOneId = ? OR channelTwoId = ?`,
      [this.channelOne, this.channelOne],
      async (err, result) => {
        this.handleError(err);
        if (!result || result.length == 0) {
          return this.insertChannelOneData().then(() => {
            this.interaction.reply(`Finding other party...`);
          });
        }
        if (result.length != 0) {
          return await this.interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `You are already connected to a meetchat session.`,
          });
        }
      }
    );
    return this;
  }
  async insertChannelOneData() {
    this.client.query(
      `INSERT INTO meetchat (connectionState, channelOneId, channelTwoId, channelOneGuildId, channelTwoGuildId, connectedOn) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.connectionState,
        this.channelOne,
        this.channelTwo,
        this.guildOne,
        this.guildTwo,
        this.connectedOn,
      ],
      (err, result) => {
        this.handleError(err);
        this.findSecondChannel(); // Moved findSecondChannel here
      }
    );
    return this;
  }
  handleConnectionAndSendConnectMessage() {
    this.client.query(
      `SELECT * FROM meetchat WHERE (channelOneId = ? OR channelTwoId = ?) AND channelOneGuildId != channelTwoGuildId`,
      [this.channelOne, this.channelOne],
      async (err, result) => {
        this.handleError(err);
        if (!result || result.length == 0) return this.init();
        this.connectionState = MeetChatConnectionStates.CONNECTED;
        let connectedMSG = `Connected to the other party! Say Hi!`;
        (
          await this.interaction.client.channels.fetch(result[0].channelOneId)
        ).send(connectedMSG);
        (
          await this.interaction.client.channels.fetch(result[0].channelTwoId)
        ).send(connectedMSG);
      }
    );
  }
  findSecondChannel() {
    this.client.query(
      `SELECT * FROM meetchat WHERE connectionState = ? AND channelOneGuildId != ? LIMIT 1`,
      [MeetChatConnectionStates.WAITING, this.guildOne],
      (err, result) => {
        this.handleError(err);

        if (result.length === 1) {
          this.connectedOn = Date.now();
          this.channelTwo = result[0].channelOneId;
          this.guildTwo = result[0].channelOneGuildId;
          this.client.query(
            `UPDATE meetchat SET channelTwoId = ?, channelTwoGuildId = ?, connectionState = ?, connectedOn = ? WHERE channelOneId = ? AND channelOneGuildId = ? AND channelTwoId = 0`,
            [
              this.channelTwo, // Updated to set channelTwo correctly,
              this.guildTwo,
              MeetChatConnectionStates.CONNECTED,
              this.connectedOn,
              this.channelOne,
              this.guildOne,
            ],
            (err, reslt) => {
              this.handleError(err);
              if (reslt) {
                this.client.query(
                  `DELETE FROM meetchat WHERE channelOneId = ? AND channelTwoId = 0`,
                  [this.channelTwo],
                  this.handleError
                );
                this.connectionState = MeetChatConnectionStates.CONNECTED;
                this.handleConnectionAndSendConnectMessage();
              }
            }
          );
        }
      }
    );

    return this;
  }

  disconnect(channel) {
    this.connectionState = MeetChatConnectionStates.DISCONNECTED;
    this.client.query(
      `SELECT * FROM \`meetchat\` WHERE \`channelOneId\` = ? OR \`channelTwoId\` = ?`,
      [channel, channel],
      async (err, result) => {
        if (!result || result.length == 0) {
          return this.interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `You are not connected to any meetchat party!`,
          });
        }
        this.handleError(err);
        if (result.length != 0) {
          let disconnectedMSG = `The Other Party Ended The Connection.`;
          result[0].channelOneId == channel && result[0].channelTwoId != 0
            ? (
                await this.interaction.client.channels.fetch(
                  result[0].channelTwoId
                )
              ).send(disconnectedMSG)
            : "";

          this.client.query(
            `DELETE FROM \`meetchat\` WHERE \`channelOneId\`= ? OR \`channelTwoId\`= ?`,
            [channel, channel],
            async (err, result) => {
              this.handleError(err);
              if (result) {
                return await this.interaction.reply(
                  `Disconnected from the other party.`
                );
              }
            }
          );
        }
      }
    );
    return this;
  }
}

module.exports = MeetChatClient;
