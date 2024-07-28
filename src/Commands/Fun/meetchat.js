const { CommandInteraction, EmbedBuilder } = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const MeetChatClient = require("../../Structures/MeetChatClient.js");
module.exports = {
  data: new CommandBuilder()
    .setName("meetchat")
    .setDescription("Meet new people by chatting")
    .setCategory("Fun")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("connection")
        .setDescription("MeetChat Connection Related Commands")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("start")
            .setDescription("Start a meetchat connection")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("end")
            .setDescription("End your meetchat connection (hang-up)")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("addfriend")
            .setDescription("Get Info About your meetchat connection")
        )
    )
    

    .setType(CommandTypes.SLASH),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    let meetChatClient = new MeetChatClient(
      interaction.channelId,
      interaction.client.db,
      interaction
    );
    if (interaction.options.getSubcommandGroup() == "connection") {
      if (interaction.options.getSubcommand() == "start") {
        interaction.client.db.query(
          `SELECT * FROM meetchat WHERE channelOneId = ? OR channelTwoId = ?`,
          [interaction.channelId, interaction.channelId],
          async (err, result) => {
            if (!result) {
              return await interaction.deferReply().then(async () => {
                interaction.followUp(`Finding other party...`);
                meetChatClient.init();
              });
            }
            if (result) {
              return await interaction.reply({
                ephemeral: true,
                content: `You are already connected to a meetchat session.`,
              });
            }
          }
        );
      }
      if (interaction.options.getSubcommand() == "end") {
        interaction.deferReply().then(async () => {
          meetChatClient.disconnect();
          await interaction.followUp(`Disconnected from the other party.`);
        });
      }
      if (interaction.options.getSubcommand() == "addfriend") {
        interaction.client.db.query(
          `SELECT * FROM meetchat WHERE channelOneId = ? OR channelTwoId = ?`,
          [interaction.channelId, interaction.channelId],
          async (err, result) => {
            if (!result) {
              await interaction.reply({
                ephemeral: true,
                content: `You are not connected to any meetchat session.`,
              });
            }
            if (result) {
              if (result[0].channelOneId == interaction.channelId) {
                (
                  await interaction.client.channels.fetch(
                    result[0].channelTwoId,
                    { force: true }
                  )
                ).send({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle(`The Other Party is Asking for Friendship!`)
                      .addFields({
                        name: `${interaction.user.username} wants to be friends with you!`,
                        value: `Make sure to add \`${interaction.user.username}\` on discord!`,
                      }),
                  ],
                });
              }
            }
            if (result[0].channelTwoId == interaction.channelId) {
              (
                await interaction.client.channels.fetch(
                  result[0].channelOneId,
                  { force: true }
                )
              ).send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`The Other Party is Asking for Friendship!`)
                    .addFields({
                      name: `${interaction.user.username} wants to be friends with you!`,
                      value: `Make sure to add \`${interaction.user.username}\` on discord!`,
                    }),
                ],
              });
            }
          }
        );
      }
    }
  },
};
