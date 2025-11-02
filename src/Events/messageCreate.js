const { Message, Events } = require("discord.js");
const ErrorEmbed = require("../Structures/ErrorEmbed.js");

module.exports = {
  name: Events.MessageCreate,
  /**
   *
   * @param {Message} message
   */
  async execute(client, message) {
    if (
      !message.content.startsWith(message.client.textCommandsPrefix) ||
      message.author.bot
    )
      return;
    let args = message.content
      .toLowerCase()
      .slice(message.client.textCommandsPrefix.length)
      .split(/ +/);
    let command = message.client.Commands.get(args[0]);
    if (command && command.data.commandType.toLowerCase() == "slash") {
      let errorEmbed = new ErrorEmbed().setError({
        name: "Wrong Command Type!",
        value: "This Command is a slash only command!",
      });
      await message.reply({ embeds: [errorEmbed] });
    } else if (command) {
      await command.execute(message, args);
    }
  },
};
