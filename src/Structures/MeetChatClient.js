const MeetChatConnectionStates = require("./Enums/MeetChatClientConnectionStates.js");
const ErrorEmbed = require("./ErrorEmbed.js");
class MeetChatClient {
  constructor(channelOne, db, interaction) {
    this.db = db;
    this.channelOne = channelOne;
    this.channelTwo = 0;
    this.connectionState = MeetChatConnectionStates.WAITING;
    this.connectedOn = 0;
    this.interaction = interaction;
  }

  async init() {
    this.db.query(
      `SELECT * FROM meetchat WHERE connectionState = ?`,
      [MeetChatConnectionStates.WAITING],
      (err, result) => {
        if (err) {
          this.interaction.reply({
            ephemeral: true,
            embeds: [
              new ErrorEmbed().setError({
                name: "An Error Occured",
                value: `${err}`,
              }),
            ],
          });
          return;
        }

        if (!result[0]) {
          this.db.query(
            `INSERT INTO meetchat (connectionState, channelOneId, channelTwoId, connectedOn) VALUES (?, ?, ?, ?)`,
            [
              this.connectionState,
              this.channelOne,
              this.channelTwo,
              this.connectedOn,
            ],
            (err, result) => {
              if (err) {
                this.interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new ErrorEmbed().setError({
                      name: "An Error Occured",
                      value: `${err}`,
                    }),
                  ],
                });
                return;
              }
              this.findSecondChannel(); // Moved findSecondChannel here
            }
          );
        } else {
          this.db.query(
            `UPDATE meetchat SET channelTwoId = ?, connectionState = ?, connectedOn = ? WHERE channelOneId != ? AND channelTwoId = 0`,
            [
              this.channelOne,
              MeetChatConnectionStates.CONNECTED,
              Date.now(),
              this.channelOne,
            ],
            async (err, result) => {
              if (err) {
                this.interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new ErrorEmbed().setError({
                      name: "An Error Occured",
                      value: `${err}`,
                    }),
                  ],
                });
                return;
              }
              this.db.query(
                `SELECT * FROM meetchat WHERE channelOneId = ? OR channelTwoId = ?`,
                [this.channelOne, this.channelOne],
                async (err, rest) => {
                  this.connectionState = MeetChatConnectionStates.CONNECTED;
                  let connectedMSG = `Connected to the other party! Say Hi!`;
                  (
                    await this.interaction.client.channels.fetch(
                      rest[0].channelOneId
                    )
                  ).send(connectedMSG);
                  (
                    await this.interaction.client.channels.fetch(
                      rest[0].channelTwoId
                    )
                  ).send(connectedMSG);
                }
              );
            }
          );
        }
      }
    );
    return this;
  }

  findSecondChannel() {
    this.db.query(
      `SELECT * FROM meetchat WHERE connectionState = ?`,
      [MeetChatConnectionStates.WAITING],
      (err, res) => {
        if (err) {
          this.interaction.reply({
            ephemeral: true,
            embeds: [
              new ErrorEmbed().setError({
                name: "An Error Occured",
                value: `${err}`,
              }),
            ],
          });
          return;
        }

        if (res.length >= 2) {
          this.connectedOn = Date.now();
          this.channelTwo =
            res[0].channelOneId === this.channelOne
              ? res[1].channelOneId
              : res[0].channelOneId;

          this.db.query(
            `UPDATE meetchat SET channelTwoId = ?, connectionState = ?, connectedOn = ? WHERE channelOneId = ?`,
            [
              this.channelTwo, // Updated to set channelTwo correctly
              MeetChatConnectionStates.CONNECTED,
              this.connectedOn,
              this.channelOne,
            ],
            (err1, reslt) => {
              if (err1) {
                console.log(err1);
                return;
              }
              if (reslt) {
                this.connectionState = MeetChatConnectionStates.CONNECTED;
                console.log(
                  "Connection established between channels:",
                  this.channelOne,
                  this.channelTwo
                );
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
    this.db.query(
      `SELECT * FROM \`meetchat\` WHERE \`channelOneId\` = ? OR \`channelTwoId\` = ?`,
      [channel, channel],
      (err, result) => {
        if (!result || result.length == 0) {
          return this.interaction.reply({
            ephemeral: true,
            content: `You are not connected to any meetchat party!`,
          });
        }
        if (err) {
          return this.interaction.reply({
            ephemeral: true,
            embeds: [
              new ErrorEmbed().setError({
                name: "An Error Occured",
                value: `${err}`,
              }),
            ],
          });
        }
        if (result.length != 0) {
          this.db.query(
            `DELETE FROM \`meetchat\` WHERE \`channelOneId\`= ? OR \`channelTwoId\`= ?`,
            [channel, channel],
            async (err, result) => {
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
