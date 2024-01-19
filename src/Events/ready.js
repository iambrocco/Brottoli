const { ActivityType } = require("discord.js");
const Client = require("../Structures/Client");
const express = require("express");
const app = express();
const port = 3000;
module.exports = {
  name: "ready",
  /**
   *
   * @param {Client} client
   */
  async execute(client) {

    app.get("/", (req, res) => {
      res.send("Ping Me PLS!");
    });
    
    app.listen(port, () => {
      console.log(`Brottoli Web Server Running on *:${port}`);
    });
    
    console.log(`${client.user.tag} is ready!`)
      client.user.setPresence({
        activities: [{ name: `/help`, type: ActivityType.Playing }],
      });
  },
};
