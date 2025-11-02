const { CommandInteraction, EmbedBuilder, MessageFlags } = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const MeetChatClient = require("../../Structures/MeetChatClient.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
module.exports = {
  data: new CommandBuilder()
    .setName("meetchat")
    .setDescription("Meet new people by chatting")
    .setCategory("Fun")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("call")
        .setDescription("MeetChat Connection Related Commands")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("start")
            .setDescription("Start a meetchat call")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("end")
            .setDescription("End your meetchat call (hang-up)")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("addfriend")
            .setDescription("Request The Other Party to be your friend")
        )
    )

    .setType(CommandTypes.SLASH),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    if(!interaction.client.isDatabaseConnected()) return interaction.reply({flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({name: 'Database Error', value: 'The database is not connected.'})]});

    let meetChatClient = new MeetChatClient(
      interaction.channelId,
      interaction.client.db,
      interaction
    );
    if (interaction.options.getSubcommandGroup() == "call") {
      if (interaction.options.getSubcommand() == "start") {
        meetChatClient.init()
      }
      if (interaction.options.getSubcommand() == "end") {
        meetChatClient.disconnect(interaction.channelId);
      }
      if (interaction.options.getSubcommand() == "addfriend") {
        interaction.client.db.query(
          `SELECT * FROM meetchat WHERE channelOneId = ? OR channelTwoId = ?`,
          [interaction.channelId, interaction.channelId],
          async (err, result) => {
            if (!result) {
              await interaction.reply({
                flags: MessageFlags.Ephemeral,
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
