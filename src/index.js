require("dotenv").config();
const Client = require("./Structures/Client");
const client = new Client({
  intents: ["GuildMessages", "GuildMembers", "MessageContent", "Guilds", "DirectMessages"],
});

client.start(process.env.token);

