// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const Client = require("../../Structures/Client.js");

module.exports = {
  data: new CommandBuilder()
    .setName("warn")
    .setDescription("Warn a Member")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH)
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to Warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason of the warning")
        .setRequired(false)
    ),
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    /**
     * @type {Client}
     */
    let client = interaction.client;
    /**
     * @type {GuildMember}
     */
    const memberOption = interaction.options.getMentionable("user");
    const reason =
      interaction.options.getString("reason") || "No Reason Provided";

    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);

    client.db.query(
      `SELECT * FROM warns WHERE userId = ${memberOption.id} AND guildId = ${interaction.guildId}`,
      async (err, resultArr, fields) => {
        if (err) {
          console.error(err);
          return interaction.reply(
            "An error occurred while processing your command."
          );
        }

        let result = resultArr[0];

        if (!result) {
          client.db.query(
            `INSERT INTO warns VALUES (${memberOption.id}, ${interaction.guildId}, 1, "${reason}")`,
            () => {
              warn(feedBackEmbed, { reason: reason, count: 1 });
            }
          );
        } else {
          const newCount = result.warnCount + 1;
          client.db.query(
            `UPDATE warns SET warnCount = ${newCount}, reason = "${
              result.reason.length > 0 ? result.reason + "," + reason : reason
            }" WHERE userId = ${memberOption.id} AND guildId = ${
              interaction.guildId
            }`,
            (err, updatedResult) => {
              if (err) {
                console.error(err);
                return interaction.reply(
                  "An error occurred while processing your command."
                );
              }
              warn(feedBackEmbed, { reason: reason, count: newCount });
            }
          );
        }
      }
    );

    function warn(embed, { reason, count }) {
      embed.setTitle("Warned " + memberOption.user.username + "!").addFields(
        {
          name: "Reason:",
          value: reason,
        },
        {
          name: "Member Now Has:",
          value: `${count} warning${count == 1 ? "" : "s"}`,
        }
      );
      interaction.reply({ embeds: [embed] });
    }
  },
};
