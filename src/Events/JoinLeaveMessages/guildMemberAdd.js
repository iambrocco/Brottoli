const { GuildMember, Events } = require("discord.js");
const Client = require("../../Structures/Client");
const { processMessage } = require("../../Data/reusableFunctions");

module.exports = {
  name: Events.GuildMemberAdd,
  /**
   *
   * @param {Client} client
   * @param {GuildMember} member
   */
  async execute(client, member) {
    /**
     * @type {import("mysql2").Connection} db
     */
    let db = client.db;

    db.query(
      `SELECT * FROM \`guilds\` WHERE \`guildId\` = ${member.guild.id}`,
      (err, result, fields) => {
        if (err || !result || !result[0]) return;
        let reslt = result[0];
        if (reslt["enabled"] == 1) {
          client.channels
            .fetch(reslt["join_channel"], {
              allowUnknownGuild: true,
              force: true,
            })
            .then((channel) => {
              let msg = processMessage(reslt["join_message"], member);
              channel.send(msg);
            });
        }
      }
    );
  },
};
