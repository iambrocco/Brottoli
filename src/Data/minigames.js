const CommandBuilder = require("../Structures/CommandBuilder");

module.exports = {
  data: new CommandBuilder()
    .setName("minigames")
    .setDescription("Play one among many minigames!")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("minegame")
        .setDescription("Tiny rpg-like game")
        .addSubcommand((subcommand) =>
          subcommand.setName("mine").setDescription("go mining")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("chop").setDescription("go mining")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("craft").setDescription("go mining")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("trade").setDescription("go mining")
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("sell").setDescription("go mining")
        )
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("tictactoe")
        .setDescription("Tic Tac Toe!")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("play")
            .setDescription("Play tictactoe within discord")
            .addMentionableOption((option) =>
              option
                .setName("user")
                .setDescription("who do you want to play against")
            )
        )
    )
    .setCategory("Gaming")
    .setType("SLASH"),
  // Implement CLICRAFT, Tic Tac Toe, 4 [nseet] (mia game),
  async execute(interaction) {},
};
