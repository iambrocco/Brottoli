const { EmbedBuilder, Colors } = require("discord.js");
const canvasImport = require("@napi-rs/canvas");
const CommandBuilder = require("../Structures/CommandBuilder.js");
const CommandTypes = require("../Structures/Enums/CommandTypes.js");
module.exports = {
  data: new CommandBuilder()
    .setName("ship")
    .setDescription("Ship Users and Find Your Love Rate!")
    .addStringOption((option) =>
      option
        .setName("names")
        .setDescription("The Names/Users of the Ship, Seperated With a Comma")
    )
    .setCategory("Fun")
    .setType(CommandTypes.SLASH),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {*} args
   */
  async execute(interaction) {
    let namesOption = interaction.options.getString("names");
    let namesArray = namesOption
      ? namesOption
          .trim()
          .split(",")
          .map((name) => name.trim())
      : [];

    async function ship({ user1, user2 }) {
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
              avatarURL: () => {
                return "https://i.imgur.com/p8oEVeT.png";
              },
            };
          }
        } else {
          return {
            username: user,
            avatarURL: () => {
              return "https://i.imgur.com/p8oEVeT.png";
            },
          };
        }
      }
      async function generateImage(firstPFP, SecondPFP, shipRate) {
        SecondPFP = SecondPFP ?? "https://i.imgur.com/p8oEVeT.png";
        let canvas = canvasImport.createCanvas(600, 300);
        let ctx = canvas.getContext("2d");

        ctx.font = "100px Noto Color Emoji";
        ctx.fillStyle = "red";
        const [imga, imgb] = await Promise.all([
          canvasImport.loadImage(firstPFP),
          canvasImport.loadImage(SecondPFP),
        ]);
        ctx.drawImage(imga, 10, 30, 256, 256); // Adjust the coordinates as needed
        ctx.drawImage(imgb, 350, 30, 256, 256); // Adjust the coordinates as needed
        shipRate <= 19 ? ctx.fillText("💔", 240, 160) : ctx.fillText("❤️", 240, 160) 

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
          "Good 😊",
          "Average 😁",
          "Nice! 😏",
          "Great! 😃",
          "Too Good 😍",
          "Perfect! 🥰😍❤️",
        ];
        let description =
          rate <= 19
            ? descriptions[0]
            : rate >= 20 && rate <= 30
            ? descriptions[1]
            : rate >= 31 && rate <= 49
            ? descriptions[2]
            : rate >= 50 && rate <= 68
            ? descriptions[3]
            : rate == 69
            ? descriptions[4]
            : rate >= 70 && rate <= 89
            ? descriptions[5]
            : rate >= 90 && rate <= 99
            ? descriptions[6]
            : rate == 100
            ? descriptions[7]
            : descriptions[2];
        return description;
      }
      function generateShipRate() {
        let shipRate = Math.ceil(Math.random() * 101);
        return shipRate;
      }
      let userOne = await checkUser(user1);
      let userTwo = await checkUser(user2);
      let shipName = generateShipName(userOne.username, userTwo.username);
      let shipRate = generateShipRate();
      let shipImage = await generateImage(
        userOne.avatarURL({ extension: "png", size: 256 }),
        userTwo.avatarURL({ extension: "png", size: 256 }),
        shipRate
      );
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
    async function checkCommandType(interaction) {
      async function bothDiscord(interaction) {
        // Fetch all members
        await interaction.guild.members.fetch();

        // Get all member IDs
        const memberIDs = interaction.guild.members.cache.map(
          (member) => member.id
        );

        // Select a random member ID
        const randomMemberID =
          memberIDs[Math.floor(Math.random() * memberIDs.length)];

        async function chooseNewUser(user, otherUserID) {
          const otherMember = await interaction.guild.members.fetch(
            otherUserID
          );
          const UserTwo = otherMember.user;

          if (user.username === UserTwo.username) {
            const newRandomMemberID =
              memberIDs[Math.floor(Math.random() * memberIDs.length)];
            return chooseNewUser(user, newRandomMemberID); // Recursive call with a new random member ID
          } else {
            return UserTwo; // Return the user object directly
          }
        }

        let otherUser = await chooseNewUser(interaction.user, randomMemberID);

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
      return namesArray.length == 0
        ? (async () => {
            return await bothDiscord(interaction);
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
            console.log("read");
            return await bothDiscord(interaction);
          })();
    }
    let users = await checkCommandType(interaction);
    await interaction.deferReply().then(() => {
      async function reply(shipResults) {
        let shipEmbed = new EmbedBuilder()
          .setTitle(`🔀 ${shipResults.shipName}`)
          .addFields({
            value: `** **`,
            name: `${shipResults.shipRate}% ${shipResults.shipRateEmojis} ${shipResults.shipRateDescription}`,
          })
          .setImage("attachment://shipImage.png")
          .setColor(Colors.Green);
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
      }
      ship({ user1: users.userOne, user2: users.userTwo })
        .then(async (shipResults) => {
          await reply(shipResults)
        })
        .catch((error) => {
          interaction.editReply("An Error Occured");
          console.log(error);
        });
    });
  },
};
