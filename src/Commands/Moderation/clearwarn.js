// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const Client = require("../../Structures/Client.js");
const ErrorEmbed = require("../../Structures/ErrorEmbed.js");
module.exports = {
  data: new CommandBuilder()
    .setName("clearwarn")
    .setDescription("Clear/Remove a member's warning/s")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setType(CommandTypes.SLASH)
    .addStringOption((option) =>
      option.setName("amount").setDescription(`Integer / "all"`).setRequired(true)
    )
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("The User You Want to remove his/her warning")
        .setRequired(true)
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
    if(!interaction.client.isDatabaseConnected()) return interaction.reply({flags: MessageFlags.Ephemeral, embeds: [new ErrorEmbed().setError({name: 'Database Error', value: 'The database is not connected.'})]});

    const memberOption = interaction.options.getMentionable("user");
    const amntopt = interaction.options.getString("amount");
    const amountOption = isNaN(parseInt(amntopt)) ? amntopt : parseInt(amntopt);
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    if(isNaN(amountOption) && amountOption !== "all") return interaction.reply({ephemeral:true, content:`**Please specify an actual amount of warns (\`all\` or \`Any Int\`)**`})
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
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`Member has no warns!`),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (result) {
          const newCount = result.count <= 0 ? 0 : result.count - (!isNaN(amountOption) ? Math.abs(amountOption) : amountOption == "all" ? result.count : 0);
          /**
           * @type {Array}
           */
          let splitresult = result.reason.split(",");
          splitresult.forEach(result => {
            splitresult.length > splitresult.length - newCount
            splitresult.pop()
          })
          let newReason = splitresult.join(",")
          client.db.query(
            newCount == 0 || amountOption == "all"
              ? `DELETE FROM warns WHERE userId = ${memberOption.id} AND guildId = ${interaction.guildId}`
              : `UPDATE warns SET count = ${newCount}, reason = "${newReason}" WHERE userId = ${
                  memberOption.id
                } AND guildId = ${interaction.guildId}`,
            (err, updatedResult) => {
              if (err) {
                console.error(err);
                return interaction.reply(
                  "An error occurred while processing your command."
                );
              }
              unwarn(feedBackEmbed, { count: newCount });
            }
          );
        }
      }
    );

    function unwarn(embed, { reason, count }) {
      embed.setTitle("Unwarned " + memberOption.user.username).addFields({
        name: "Member Now Has:",
        value: `${count} warning${count == 1 ? "" : "s"}`,
      });
      interaction.reply({ embeds: [embed] });
    }
  },
};
