const { EmbedBuilder } = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder");

module.exports = {
  data: new CommandBuilder()
    .setName("avatar")
    .setDescription("Gets a User's Avatar")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The User You Want The Avatar of")
    )
    .setType("BOTH")
    .setCategory("Miscellaneous"),
  async execute(interaction, args) {
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
          ? interaction.client.users.cache
              .get(args[1].replace("<@", "").replace(">", ""))
              .avatarURL()
          : "Invalid Arguments! Please mention someone!"
        : interaction.author.avatarURL()
      : false;
    let args1Found = interaction.content
      ? invalidArgs
      : interaction.content
      ? interaction.author.avatarURL()
      : false;
    let userOptionFound = interaction.content
      ? ""
      : interaction.options.getUser("user")
      ? user.avatarURL()
      : interaction.user.avatarURL();
    let userAv = interaction.content ? args1Found : userOptionFound;
   
    await interaction.reply(`[${user.displayName}'s Avatar](${userAv})`);
  },
};
