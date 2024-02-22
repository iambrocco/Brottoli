const { EmbedBuilder, User } = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");

module.exports = {
  data: new CommandBuilder()
    .setName("avatar")
    .setDescription("Gets a User's Avatar")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The User You Want The Avatar of")
    )
    .setType(CommandTypes.BOTH)
    .setCategory("Miscellaneous"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Array} args
   */
  async execute(interaction, args) {
    /**
     * @type {User}
     */
    let user = interaction.content
      ? args[1]
        ? interaction.client.users.cache.get(
            args[1].replace("<@", "").replace(">", "")
          ).displayName
        : interaction.author.displayName
      : interaction.options.getUser("user");
    let invalidArgs = interaction.content
      ? args[1]
        ? args[1].startsWith("<@")
          ? interaction.client.users.cache.get(
              args[1].replace("<@", "").replace(">", "")
            )
          : "Invalid Arguments! Please mention someone!"
        : interaction.author
      : false;
    let args1Found = interaction.content
      ? invalidArgs
      : interaction.content
      ? interaction.author
      : false;
    let userOptionFound = interaction.content
      ? ""
      : interaction.options.getUser("user")
      ? user
      : interaction.user;
    let userAv = interaction.content ? args1Found : userOptionFound;
    let avatarEmbed = new EmbedBuilder()
      .setTitle(`${userAv.globalName ?? "User"}'s Avatar`)
      .setDescription(
        `[PNG](${userAv.avatarURL({
          extension: "png",
        })}) | [JPG](${userAv.avatarURL({
          extension: "jpg",
        })}) | [GIF](${userAv.avatarURL({ extension: "gif" })})`
      )
      .setImage(`${userAv.avatarURL({ extension: "png", size: 1024 })}`);
    await interaction.reply({ embeds: [avatarEmbed] });
  },
};
