// Imports
const discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

// Creating the Client
const client = new discord.Client({
  intents: [
    discord.Intents.FLAGS.DIRECT_MESSAGES,
    discord.Intents.FLAGS.GUILD_MESSAGES,
    discord.Intents.FLAGS.GUILD_PRESENCES,
    discord.Intents.FLAGS.MESSAGE_CONTENT,
    discord.Intents.FLAGS.GUILD_MESSAGES
  ],
});

// Event Handling
const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

  

// Command Handling
client.commands = new discord.Collection();
const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs
.readdirSync(commandsPath)
.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Registering Command Files as Bot Commands
  client.commands.set(command.data.name, command);
}




// Logging to the Console that the bot is ready
client.on("ready", () =>{
  console.clear()
  console.log(client.user.tag, "is ready!");
})

// Logging In
client.login(process.env.token);
