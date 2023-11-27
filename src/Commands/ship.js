const {
  EmbedBuilder,
  Colors,
  codeBlock,
  inlineCode,
  bold,
  User,
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
    let namesOption = interaction.options.getString("names");
    let namesArray = namesOption
      ? namesOption
          .trim()
          .split(",")
          .map((name) => name.trim())
      : [];

    async function ship({ user1, user2 }) {
      await interaction.deferReply();

      async function checkUser(userResolvable) {
        let user = `${userResolvable}`;
        let userId = user.replace("<@", "").replace(">", "");
        if (
          userId.length <= 19 &&
          userId.length >= 18 &&
          !isNaN(parseInt(userId))
        ) {
          try {
            return await interaction.client.users.fetch(userId);
          } catch {
            return {
              username: user,
              avatarURL: ({ extension, size }) => {
                return "https://i.imgur.com/p8oEVeT.png";
              },
            };
          }
        } else {
          return {
            username: user,
            avatarURL: ({ extension, size }) => {
              return "https://i.imgur.com/p8oEVeT.png";
            },
          };
        }
      }
      async function generateImage(firstPFP, SecondPFP) {
        SecondPFP = SecondPFP ?? "https://i.imgur.com/p8oEVeT.png";
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
        ctx.drawImage(imga, 10, 30, 256, 256); // Adjust the coordinates as needed
        ctx.drawImage(imgb, 350, 30, 256, 256); // Adjust the coordinates as needed
        ctx.fillText("❤️", 240, 160);

        const buffer = canvas.toBuffer("image/png");

        return buffer;
      }
      function generateEmoji(rate) {
        let emptyEmoji = "⬛";
        let fullEmoji = "🟩";
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
      function generateShipName(name1, name2) {
        let newShipName =
          name1.substring(0, Math.floor(name1.length / 2)) +
          name2.substring(Math.floor(name2.length / 2));

        return newShipName;
      }
      function generateShipRateDescription(rate) {
        let descriptions = [
          "Terrible 😐",
          "Not Too Bad 🙃",
          "Average 😁",
          "Nice! 😏",
          "Above Average 😃",
          "Too Good 😍",
          "Perfect! 🥰😍❤️",
        ];
        let description =
          rate <= 19
            ? descriptions[0]
            : rate >= 20 && rate <= 40
            ? descriptions[1]
            : rate >= 41 && rate <= 68
            ? descriptions[2]
            : rate == 69
            ? descriptions[3]
            : rate >= 70 && rate <= 99
            ? descriptions[4]
            : rate == 100
            ? descriptions[5]
            : descriptions[2];
        return description;
      }
      function generateShipRate() {
        let shipRate = Math.ceil(Math.random() * 100);
        return shipRate;
      }
      let userOne = await checkUser(user1);
      let userTwo = await checkUser(user2);
      let shipName = generateShipName(userOne.username, userTwo.username);
      let shipImage = await generateImage(
        userOne.avatarURL({ extension: "png", size: 256 }),
        userTwo.avatarURL({ extension: "png", size: 256 })
      );
      let shipRate = generateShipRate();
      let shipRateEmojis = generateEmoji(shipRate);
      let shipRateDescription = generateShipRateDescription(shipRate);
      return {
        shipName: shipName,
        shipImage: shipImage,
        shipRate: shipRate,
        shipRateEmojis: shipRateEmojis,
        shipRateDescription: shipRateDescription,
        shipTitle: `💗 **MATCHING** 💗\n🔻\`${userOne.username}\`\n🔺\`${userTwo.username}\``,
        shipUserOne: userOne,
        shipUserTwo: userTwo,
      };
    }
    async function bothDiscord() {
      // Defer the initial reply
      let otherUserID = interaction.guild.members.cache.randomKey();

      async function chooseNewUser(user, otherUser) {
        const UserTwo = interaction.guild.members.cache.get(otherUser).user;

        if (user.username === UserTwo.username) {
          otherUser = interaction.guild.members.cache.randomKey();
          return chooseNewUser(user, otherUser); // Fix: Return the recursive call
        } else {
          let otherUserObject =
            interaction.guild.members.cache.get(otherUser).user;
          return otherUserObject; // Fix: Return the user object directly
        }
      }

      let otherUser = await chooseNewUser(interaction.user, otherUserID);

      return {
        userOne: interaction.user.id,
        userTwo: otherUser.id,
      };
    }

    function singleDiscord() {
      return {
        userOne: interaction.user.id,
        userTwo: namesArray[0],
      };
    }
    function bothNotDiscord() {
      return {
        userOne: namesArray[0],
        userTwo: namesArray[1],
      };
    }
    async function checkCommandType() {
      return namesArray.length == 0
        ? (async () => {
            return await bothDiscord();
          })()
        : namesArray.length == 1
        ? (() => {
            return singleDiscord();
          })()
        : namesArray.length == 2
        ? (() => {
            return bothNotDiscord();
          })()
        : (async () => {
            return await bothDiscord();
          })();
    }
    let users = await checkCommandType();
    ship({ user1: users.userOne, user2: users.userTwo })
      .then(async (shipResults) => {
        let shipEmbed = new EmbedBuilder()
          .setTitle(`🔀 ${shipResults.shipName}`)
          .addFields({
            value: `** **`,
            name: `${shipResults.shipRate}% ${shipResults.shipRateEmojis} ${shipResults.shipRateDescription}`,
          })
          .setImage("attachment://shipImage.png");
        await interaction.editReply({
          content: `${shipResults.shipTitle}`,
          embeds: [shipEmbed],
          files: [
            {
              name: "shipImage.png",
              attachment: shipResults.shipImage,
            },
          ],
        });
      })
      .catch((error) => {
        interaction.editReply("An Error Occured");
        console.log(error);
      });
  },
};
