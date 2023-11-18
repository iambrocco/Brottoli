require("dotenv").config()
const Client = require("./src/Structures/Client")
const client = new Client({intents: ["GuildMessages", "GuildMembers", "MessageContent", "Guilds"]})
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
client.start(process.env.token)
