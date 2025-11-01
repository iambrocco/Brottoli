const { User, EmbedBuilder } = require("discord.js");
const Client = require("../../Structures/Client");

module.exports = {
  name: "messageReactionAdd",
  /**
   * @param {Client} client
   * @param {import("discord.js").MessageReaction} reaction
   * @param {User} user
   */
  async execute(client, reaction, user) {
    reaction.message.fetch(true);
    try {
      client.db.query(
        `SELECT * FROM reaction_roles WHERE channelId = ${reaction.message.channelId} AND emoji = '${reaction.emoji.name}'`,
        async (err, results) => {
          if (err) {
            return;
          }

          if (results.length > 0) {
            const roleID = results[0].roleId;
            const role = await reaction.message.guild.roles.fetch(roleID, {
              force: true,
            });
            if (role) {
              await reaction.message.guild.members
                .resolve(user)
                .roles.add(role)
                .catch(async (err) => {
                  if (err.rawError.message == "Missing Permissions") {
                    if (user.bot) {
                      reaction.message.channel
                        .send({
                          embeds: [
                            new EmbedBuilder()
                              .setTitle(`Insufficient Permissions!`)
                              .setDescription(
                                `Please make the bot's role higher than the role you want to give!`
                              )
                              .setImage(`https://i.imgur.com/dLbJoEA.gif`),
                          ],
                        })
                        .then((message) => {
                          setTimeout(() => {
                            message.delete();
                          }, 10000);
                        });
                    }
                  }
                });
            } else {
              client.log("err");
            }
          }
        }
      );
    } catch (error) {
      client.log(`Error`);
    }
  },
};
