const {
  EmbedBuilder,
  Colors,
  codeBlock,
  inlineCode,
  bold,
} = require("discord.js");
const CommandBuilder = require("../Structures/CommandBuilder");
module.exports = {
  data: new CommandBuilder()
    .setName("ship")
    .setDescription("ship users and find your love rate!")
    .addStringOption((option) =>
      option
        .setName("names")
        .setDescription("The names/users of the ship, seperated with a comma")
    )
    .setCategory("Fun")
    .setType("SLASH"),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {*} args
   */
  async execute(interaction, args) {
    async function generateImage(firstPFP, SecondPFP) {
      SecondPFP = SecondPFP ?? firstPFP;
      const canvasImport = require("canvas");
      let canvas = canvasImport.createCanvas(600, 300);
      let ctx = canvas.getContext("2d");
      canvasImport.registerFont("./src/Data/Twemoji.ttf", {
        family: "Twemoji",
      });
      ctx.font = "100px Twemoji";
      ctx.fillStyle = "red";
      const [imga, imgb] = await Promise.all([
        canvasImport.loadImage(firstPFP),
        canvasImport.loadImage(SecondPFP),
      ]);
      ctx.drawImage(imga, 10, 30); // Adjust the coordinates as needed
      ctx.drawImage(imgb, 350, 30); // Adjust the coordinates as needed
      ctx.fillText("❤️", 240, 160);

      const buffer = canvas.toBuffer("image/png");

      return buffer;
    }
    let namesOption = interaction.options.getString("names");
    let namesArray = namesOption
      ? namesOption
          .trim()
          .split(",")
          .map((name) => name.trim())
      : [];
    function generateShipName(name1, name2) {
      let shipRate = Math.ceil(Math.random() * 100);
      let emptyEmoji = "⬛";
      let fullEmoji = "🟩";
      function generateEmoji(rate) {
        let fullEmojiCount = Math.floor(rate / 10);
        let emojis = "";
        for (let i = 0; i < fullEmojiCount; i++) {
          emojis += fullEmoji;
        }
        for (let i = 0; i < 10 - fullEmojiCount; i++) {
          emojis += emptyEmoji;
        }
        return emojis;
      }
      let newShipName =
        name1.substring(0, Math.floor(name1.length / 2)) +
        name2.substring(Math.floor(name2.length / 2));
      let addition = `${codeBlock(`${name1} loves ${name2} ${shipRate}%`)}`;
      let shipEmbed = new EmbedBuilder()
        .setTitle(`🔀 ${newShipName}`)
        .addFields({
          name: `${generateEmoji(shipRate)} - ${shipRate}%`,
          value: `${addition}`,
        });
      let returnable = {
        shipName: inlineCode(newShipName),
        loveMessage: addition,
        titleMessage: `💗 ${bold("MATCHING")} 💗\n🔻${inlineCode(
          name1
        )}\n🔺${inlineCode(name2)}`,
        shipEmbed: shipEmbed,
        shipRate: shipRate,
        name1: name1,
        name2: name2,
      };
      return returnable;
    }
    async function bothDiscord() {
      // Defer the initial reply
      await interaction.deferReply();

      let otherUser = interaction.guild.members.cache.randomKey();
      async function chooseNewUser(user, otherUser) {
        const otherUserName =
          interaction.guild.members.cache.get(otherUser).user.username;
        if (user.username === otherUserName) {
          otherUser = interaction.guild.members.cache.randomKey();
          chooseNewUser(user, otherUser);
        } else {
          let otherUserName =
            interaction.guild.members.cache.get(otherUser).user;
          let shipName = generateShipName(userUsername, otherUserName.username);
          let buffer = await generateImage(
            interaction.user.avatarURL({ extension: "png", size: 256 }),
            otherUserName.avatarURL({ extension: "png", size: 256 })
          );

          // Send the follow-up message with the generated image
          interaction.editReply({
            content: `${shipName.titleMessage}`,
            embeds: [shipName.shipEmbed.setImage("attachment://shipImage.png")],
            files: [
              {
                attachment: buffer,
                name: "shipImage.png",
              },
            ],
          });
        }
      }

      let userUsername = interaction.user.username;

      chooseNewUser(interaction.user, otherUser);
    }
    function singleDiscord() {
      let otherUser = namesArray[0];
      let shipName = generateShipName(interaction.user.username, otherUser);
      interaction.reply({
        content: `${shipName.titleMessage}`,
        embeds: [shipName.shipEmbed],
      });
    }
    function bothNotDiscord() {
      let otherUser = namesArray[1];
      let shipName = generateShipName(namesArray[0], otherUser);
      interaction.reply({
        content: `${shipName.titleMessage}`,
        embeds: [shipName.shipEmbed],
      });
    }
    function checkCommandType() {
      namesArray.length == 0
        ? bothDiscord()
        : namesArray.length == 1
        ? singleDiscord()
        : namesArray.length == 2
        ? bothNotDiscord()
        : bothDiscord();
    }
    checkCommandType();
  },
};
