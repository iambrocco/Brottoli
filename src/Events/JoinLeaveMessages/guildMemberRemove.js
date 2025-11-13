const { User, Events } = require("discord.js");
const Client = require("../../Structures/Client");
const { processMessage } = require("../../Data/reusableFunctions");
module.exports = {
  name: Events.GuildMemberRemove,
  /**
   *
   * @param {Client} client
   * @param {User} member
   */
  async execute(client, member) {
    /**
     * @type {import("mysql2").Connection} db
     */

    client.query(
      `SELECT * FROM \`guilds\` WHERE \`guildId\` = ${member.guild.id}`,
      (err, result, fields) => {
        if (err || !result || !result[0]) return;
        let reslt = result[0];
        if (reslt["enabled"] == 1) {
          client.channels
            .fetch(reslt["leave_channel"], {
              allowUnknownGuild: true,
              force: true,
            })
            .then((channel) => {
              channel.send(processMessage(reslt["leave_message"]));
            });
        }
      }
    );
  },
};
