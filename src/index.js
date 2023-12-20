require("dotenv").config();
const Client = require("./Structures/Client");
const express = require("express");
const app = express();
const port = 3000;
const client = new Client({
  intents: ["GuildMessages", "GuildMembers", "MessageContent", "Guilds"],
});

client.start(process.env.token);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
