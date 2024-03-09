// Import
const {
  GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
} = require("discord.js");
const CommandBuilder = require("../../Structures/CommandBuilder.js");
const CommandTypes = require("../../Structures/Enums/CommandTypes.js");
const ms = require("ms");
module.exports = {
  data: new CommandBuilder()
    .setName("purge")
    .setDescription("Delete a Number of Message")
    .setCategory("Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setType(CommandTypes.SLASH)

    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The Amount of messages you want to delete")
        .setRequired(true)
    ),
  async execute(interaction) {
    const feedBackEmbed = new EmbedBuilder().setColor(Colors.Green);
    (async () => {
      interaction.memberPermissions.has("ManageMessages")
        ? (async () => {
            let amount = interaction.options.getNumber("amount");
            async function purge(amount) {
              await interaction.channel
                .bulkDelete(amount, true)
                .then(async () => {
                  await interaction
                    .reply(`Successfully Deleted ${amount} messages`)
                    .then((message) => {
                      setTimeout(() => {
                        message.delete();
                      }, 2500);
                    });
                  await interaction.followUp({
                    content: `Messages Older than 14 days can't be deleted by Bots because of Discord's API Limit.`,
                    ephemeral: true,
                  });
                });
            }
            amount
              ? amount <= 0 || amount > 100
                ? interaction.reply(
                    "Please Provide a Value Larger than 0 and Less Than 100"
                  )
                : await purge(amount)
              : interaction.reply("Please Provide a Value");
          })()
        : (async () => {
            feedBackEmbed
              .setColor(Colors.Red)
              .setTitle("Failed To Purge Messages")
              .addFields({
                name: "Error",
                value: "Insufficient Permissions!",
              });
            interaction.reply({ embeds: [feedBackEmbed] }).then((message) => {
              setTimeout(() => {
                message.delete();
              }, 2500);
            });
          })();
    })();
  },
};
